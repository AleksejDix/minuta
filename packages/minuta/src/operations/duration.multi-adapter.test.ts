import { describe, expect, it } from "vitest";
import { durationWith, length } from "./duration";
import { periodWith, range } from "./period";
import type { Unit } from "#src/types";
import { getUnitsTestCases } from "#src/test/shared-adapter-tests";

const MS_PER_HOUR = 3_600_000;
const ZERO = 0;
const ONE = 1;
const TWO = 2;
const FOUR = 4;
const SEVEN = 7;
const TWELVE = 12;
const TWENTY_FOUR = 24;
const TWENTY_EIGHT = 28;
const TWENTY_NINE = 29;
const THIRTY_ONE = 31;
const NINETY = 90;

const UNITS: readonly Unit[] = [
  "year",
  "quarter",
  "month",
  "week",
  "day",
  "hour",
  "minute",
  "second",
];

// Spring forward and fall back in Europe and in North America
const DST_DAYS: readonly Readonly<Date>[] = [
  new Date("2026-03-29T12:00"),
  new Date("2026-10-25T12:00"),
  new Date("2026-03-08T12:00"),
  new Date("2026-11-01T12:00"),
];

type CalendarCase = Readonly<{
  count: Unit;
  expected: number;
  of: Unit;
  on: string;
}>;

const CALENDAR_CASES: readonly CalendarCase[] = [
  { count: "hour", expected: TWENTY_FOUR, of: "day", on: "2026-10-08T12:00" },
  { count: "day", expected: SEVEN, of: "week", on: "2026-03-04T12:00" },
  { count: "month", expected: TWELVE, of: "year", on: "2026-06-01T12:00" },
  { count: "quarter", expected: FOUR, of: "year", on: "2026-06-01T12:00" },
  { count: "day", expected: TWENTY_EIGHT, of: "month", on: "2026-02-01T12:00" },
  { count: "day", expected: TWENTY_NINE, of: "month", on: "2024-02-10T12:00" },
  { count: "day", expected: THIRTY_ONE, of: "month", on: "2026-03-01T12:00" },
];

const unitsCases = getUnitsTestCases();

describe("length()", () => {
  it("measures the half-open range in ms", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const hour = range(
      new Date("2026-01-05T09:00"),
      new Date("2026-01-05T09:59:59.999")
    );
    expect(length(hour)).toBe(MS_PER_HOUR);
  });
});

describe.each(unitsCases)("durationWith() with %s adapter", (_name, units) => {
  it("counts one of its own unit for every period", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const date = new Date("2026-10-08T14:30");
    for (const unit of UNITS) {
      expect(durationWith(units, periodWith(units, date, unit), unit)).toBe(
        ONE
      );
    }
  });

  it.each(CALENDAR_CASES)(
    "counts the $count units of the $of of $on",
    { timeout: 5000 },
    ({ count, expected, of, on }) => {
      expect.hasAssertions();
      const measured = periodWith(units, new Date(on), of);
      expect(durationWith(units, measured, count)).toBe(expected);
    }
  );

  it("counts only complete units", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const ninetyMinutes = range(
      new Date("2026-01-05T09:00"),
      new Date("2026-01-05T10:29:59.999")
    );
    const lateEvening = range(
      new Date("2026-01-05T23:00"),
      new Date("2026-01-06T00:59:59.999")
    );
    expect(durationWith(units, ninetyMinutes, "hour")).toBe(ONE);
    expect(durationWith(units, ninetyMinutes, "minute")).toBe(NINETY);
    expect(durationWith(units, lateEvening, "day")).toBe(ZERO);
    expect(durationWith(units, lateEvening, "hour")).toBe(TWO);
  });

  it("returns 0 for a zero-width range", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const instant = new Date("2026-01-05T09:00");
    expect(durationWith(units, range(instant, instant), "second")).toBe(ZERO);
  });
});

describe.each(unitsCases)(
  "durationWith() over DST with %s adapter",
  (_name, units) => {
    it("counts the real hours of DST days", { timeout: 5000 }, () => {
      expect.hasAssertions();
      // 23 and 25 in zones with these changes, 24 elsewhere
      for (const date of DST_DAYS) {
        const day = periodWith(units, date, "day");
        expect(durationWith(units, day, "hour")).toBe(
          length(day) / MS_PER_HOUR
        );
        expect(durationWith(units, day, "day")).toBe(ONE);
      }
    });
  }
);
