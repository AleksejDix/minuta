import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type { Units } from "#src/types";
import { dateFnsTzUnits } from "#src/adapters/date-fns-tz/index";
import { divideWith } from "#src/operations/divide";
import { getUnitsTestCases } from "#src/test/shared-adapter-tests";
import { nextWith } from "#src/operations/shift";
import { periodWith } from "#src/operations/period";

/*
 * In America/Santiago daylight saving time ends at midnight: on Apr 5 2026
 * the clocks go back from 00:00 to 23:00 (UTC−3 → UTC−4). Apr 4 has 25
 * hours; its last hour, 23:00–23:59, happens twice.
 */
const APR_4_START = new Date("2026-04-04T03:00:00Z");
const APR_4_END = new Date("2026-04-05T03:59:59.999Z");
const APR_5_START = new Date("2026-04-05T04:00:00Z");
const LONG_DAY_HOURS = 25;
const APRIL_DAYS = 30;
const ONE_MS = 1;
const MID_APRIL = new Date("2026-04-15T12:00:00Z");
const MID_OCTOBER = new Date("2026-10-15T12:00:00Z");

// Where a day of the month holding `inMonth` does not start right after the one before
function untouched(units: Units, inMonth: Readonly<Date>): string[] {
  const month = periodWith(units, inMonth, "month");
  const days = divideWith(units, month, "day");
  return days.flatMap((day, index) => {
    const following = days[index + ONE_MS];
    if (
      following === undefined ||
      following.start.getTime() === day.end.getTime() + ONE_MS
    ) {
      return [];
    }
    return [`${day.start.toISOString()} → ${following.start.toISOString()}`];
  });
}

type Case = readonly [name: string, units: Units, computerZone: string];

// The date-fns-tz engine from a computer in UTC, as in CI; the others from a computer in Santiago
const CASES: readonly Case[] = [
  ["date-fns-tz", dateFnsTzUnits({ timeZone: "America/Santiago" }), "UTC"],
  ...getUnitsTestCases().map(([name, units]): Case => [
    name,
    units,
    "America/Santiago",
  ]),
];

describe.each(CASES)("repeated hour with %s", (_name, units, computerZone) => {
  beforeAll(() => {
    vi.stubEnv("TZ", computerZone);
  });

  afterAll(() => {
    vi.unstubAllEnvs();
  });

  it(
    "apr 4 has 25 hours, ending after the repeated hour",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const apr4 = periodWith(units, new Date("2026-04-04T15:00:00Z"), "day");
      expect(apr4.start).toStrictEqual(APR_4_START);
      expect(apr4.end).toStrictEqual(APR_4_END);
      expect(divideWith(units, apr4, "hour")).toHaveLength(LONG_DAY_HOURS);
    }
  );

  it("next() of apr 4 is apr 5", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const apr4 = periodWith(units, new Date("2026-04-04T15:00:00Z"), "day");
    expect(nextWith(units, apr4).start).toStrictEqual(APR_5_START);
  });

  it("april splits into 30 touching days", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const april = periodWith(units, MID_APRIL, "month");
    expect(divideWith(units, april, "day")).toHaveLength(APRIL_DAYS);
    expect(untouched(units, MID_APRIL)).toStrictEqual([]);
  });
});

/*
 * In Atlantic/Azores the clocks go back at 01:00 to 00:00 on Oct 25 2026
 * (UTC+0 → UTC−1), so the day's first hour, 00:00–00:59, happens twice.
 * The day starts at the first midnight.
 */
const OCT_25_START = new Date("2026-10-25T00:00:00Z");
const OCT_25_END = new Date("2026-10-26T00:59:59.999Z");
const OCTOBER_DAYS = 31;

const MIDNIGHT_CASES: readonly Case[] = [
  ["date-fns-tz", dateFnsTzUnits({ timeZone: "Atlantic/Azores" }), "UTC"],
  ...getUnitsTestCases().map(([name, units]): Case => [
    name,
    units,
    "Atlantic/Azores",
  ]),
];

describe.each(MIDNIGHT_CASES)(
  "repeated midnight with %s",
  (_name, units, computerZone) => {
    beforeAll(() => {
      vi.stubEnv("TZ", computerZone);
    });

    afterAll(() => {
      vi.unstubAllEnvs();
    });

    it(
      "oct 25 starts at the first midnight and has 25 hours",
      { timeout: 5000 },
      () => {
        expect.hasAssertions();
        const oct25 = periodWith(
          units,
          new Date("2026-10-25T15:00:00Z"),
          "day"
        );
        expect(oct25.start).toStrictEqual(OCT_25_START);
        expect(oct25.end).toStrictEqual(OCT_25_END);
        expect(divideWith(units, oct25, "hour")).toHaveLength(LONG_DAY_HOURS);
      }
    );

    it("october splits into 31 touching days", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const october = periodWith(units, MID_OCTOBER, "month");
      expect(divideWith(units, october, "day")).toHaveLength(OCTOBER_DAYS);
      expect(untouched(units, MID_OCTOBER)).toStrictEqual([]);
    });
  }
);
