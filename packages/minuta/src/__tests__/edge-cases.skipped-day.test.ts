import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { nextWith, previousWith, shiftWith } from "#src/operations/shift";
import type { Period } from "#src/types";
import { dateFnsTzUnits } from "#src/adapters/date-fns-tz/index";
import { getUnitsTestCases } from "#src/test/shared-adapter-tests";
import { periodWith } from "#src/operations/period";

/*
 * On Dec 29 2011 Samoa moved across the date line: the day after Thursday
 * Dec 29 was Saturday Dec 31. Dec 30 2011 never happened in Pacific/Apia.
 * Dec 29 runs on UTC−10, Dec 31 on UTC+14.
 */
const apia = dateFnsTzUnits({ timeZone: "Pacific/Apia" });

const DEC_29_START = new Date("2011-12-29T10:00:00Z");
const DEC_31_START = new Date("2011-12-30T10:00:00Z");
const JAN_1_START = new Date("2011-12-31T10:00:00Z");
const ONE_MS = 1;
const ONE = 1;
const TWO = 2;
const DAYS_TO_STEP = 12;

function dayAt(iso: string): Period {
  return periodWith(apia, new Date(iso), "day");
}

// Each step from `first` whose next day does not start right after it ends
function brokenSteps(first: Period, count: number): string[] {
  const broken: string[] = [];
  let day = first;
  for (let step = 0; step < count; step += ONE) {
    const following = nextWith(apia, day);
    if (following.start.getTime() !== day.end.getTime() + ONE_MS) {
      broken.push(
        `${day.start.toISOString()} → ${following.start.toISOString()}`
      );
    }
    day = following;
  }
  return broken;
}

describe("skipped day: Samoa, Dec 30 2011", () => {
  it("next() of Dec 29 is Dec 31", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const dec29 = dayAt("2011-12-29T12:00:00Z");
    expect(dec29.start).toStrictEqual(DEC_29_START);
    expect(nextWith(apia, dec29).start).toStrictEqual(DEC_31_START);
  });

  it("previous() of Dec 31 is Dec 29", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const dec31 = dayAt("2011-12-30T12:00:00Z");
    expect(dec31.start).toStrictEqual(DEC_31_START);
    expect(previousWith(apia, dec31).start).toStrictEqual(DEC_29_START);
  });

  it("shift() counts days that exist", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const dec29 = dayAt("2011-12-29T12:00:00Z");
    const jan1 = dayAt("2011-12-31T12:00:00Z");
    expect(shiftWith(apia, dec29, ONE).start).toStrictEqual(DEC_31_START);
    expect(shiftWith(apia, dec29, TWO).start).toStrictEqual(JAN_1_START);
    expect(shiftWith(apia, jan1, -TWO).start).toStrictEqual(DEC_29_START);
  });

  it(
    "stepping day by day never stalls, overlaps or leaves a gap",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const broken = brokenSteps(dayAt("2011-12-25T12:00:00Z"), DAYS_TO_STEP);
      expect(broken).toStrictEqual([]);
    }
  );
});

/*
 * The other engines compute in the computer's zone. Switch it to Samoa for
 * these tests (vi.stubEnv sets process.env.TZ, which Node reads again on
 * every Date operation) and restore it afterwards.
 */
describe.each(getUnitsTestCases())(
  "skipped day in the computer's zone with %s",
  (_name, units) => {
    beforeAll(() => {
      vi.stubEnv("TZ", "Pacific/Apia");
    });

    afterAll(() => {
      vi.unstubAllEnvs();
    });

    it("next() of Dec 29 is Dec 31", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const dec29 = periodWith(units, new Date("2011-12-29T12:00:00Z"), "day");
      expect(nextWith(units, dec29).start).toStrictEqual(DEC_31_START);
    });

    it("previous() of Dec 31 is Dec 29", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const dec31 = periodWith(units, new Date("2011-12-30T12:00:00Z"), "day");
      expect(previousWith(units, dec31).start).toStrictEqual(DEC_29_START);
    });
  }
);
