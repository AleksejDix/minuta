import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { dateFnsTzUnits } from "#src/adapters/date-fns-tz/index";
import { divideWith } from "#src/operations/divide";
import { getUnitsTestCases } from "#src/test/shared-adapter-tests";
import { nextWith } from "#src/operations/shift";
import { periodWith } from "#src/operations/period";

/*
 * In America/Santiago daylight saving time starts at midnight: on Sep 6 2026
 * the clocks jump from 00:00 straight to 01:00 (UTC−4 → UTC−3). That day
 * starts at 01:00 and has 23 hours; there is no midnight.
 */
const santiago = dateFnsTzUnits({ timeZone: "America/Santiago" });

const SEP_5_START = new Date("2026-09-05T04:00:00Z");
const SEP_6_START = new Date("2026-09-06T04:00:00Z");
const SEP_6_END = new Date("2026-09-07T02:59:59.999Z");
const ONE_MS = 1;
const SHORT_DAY_HOURS = 23;
const SEPTEMBER_DAYS = 30;

describe("missing midnight: Santiago, Sep 6 2026", () => {
  // The bug shows when the computer is not in Santiago's zone, as in CI
  beforeAll(() => {
    vi.stubEnv("TZ", "UTC");
  });

  afterAll(() => {
    vi.unstubAllEnvs();
  });

  it("the day starts at 01:00 and has 23 hours", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const day = periodWith(santiago, new Date("2026-09-06T12:00:00Z"), "day");
    expect(day.start).toStrictEqual(SEP_6_START);
    expect(day.end).toStrictEqual(SEP_6_END);
    expect(divideWith(santiago, day, "hour")).toHaveLength(SHORT_DAY_HOURS);
  });

  it("does not overlap the day before", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const sep5 = periodWith(santiago, new Date("2026-09-05T12:00:00Z"), "day");
    expect(sep5.start).toStrictEqual(SEP_5_START);
    expect(sep5.end.getTime() + ONE_MS).toBe(SEP_6_START.getTime());
    expect(nextWith(santiago, sep5).start).toStrictEqual(SEP_6_START);
  });

  it("september splits into 30 touching days", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const september = periodWith(
      santiago,
      new Date("2026-09-15T12:00:00Z"),
      "month"
    );
    const days = divideWith(santiago, september, "day");
    expect(days).toHaveLength(SEPTEMBER_DAYS);
    expect(days.map((day) => day.unit)).toStrictEqual(
      Array.from({ length: SEPTEMBER_DAYS }, () => "day")
    );
    expect(
      days.find((day) => day.start.getTime() === SEP_6_START.getTime())
    ).toBeDefined();
  });
});

/*
 * The other engines compute in the computer's zone; with the computer in
 * Santiago they must give the same day.
 */
describe.each(getUnitsTestCases())(
  "missing midnight in the computer's zone with %s",
  (_name, units) => {
    beforeAll(() => {
      vi.stubEnv("TZ", "America/Santiago");
    });

    afterAll(() => {
      vi.unstubAllEnvs();
    });

    it("the day starts at 01:00 and has 23 hours", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const day = periodWith(units, new Date("2026-09-06T12:00:00Z"), "day");
      expect(day.start).toStrictEqual(SEP_6_START);
      expect(day.end).toStrictEqual(SEP_6_END);
    });
  }
);
