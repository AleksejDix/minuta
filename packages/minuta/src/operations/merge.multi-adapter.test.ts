import type { Period, Unit, Units } from "#src/types";
import { describe, expect, it } from "vitest";
import { divideWith } from "./divide";
import { getUnitsTestCases } from "#src/test/shared-adapter-tests";
import { mergeWith } from "./merge";
import { periodWith as period } from "./period";

const YEAR_2024 = 2024;
const JANUARY = 0;
const DECEMBER = 11;
const DAY_15 = 15;
const MIDNIGHT = 0;
const LAST_HOUR = 23;
const NOON = 12;
const LAST_MORNING_HOUR = 11;
const TWO_PM = 14;
const ZERO = 0;
const HALF_HOUR_MINUTE = 30;
const LAST_MINUTE = 59;
const LAST_SECOND = 59;

const adapters = getUnitsTestCases();

/**
 * Merge periods that are known to be non-empty.
 *
 * @param units - Unit specs
 * @param periods - Periods to merge, at least one
 * @param targetUnit - Unit of the merged period
 * @returns The merged period
 */
function mergeOrFail(
  units: Units,
  periods: readonly Period[],
  targetUnit?: Unit
): Period {
  const merged = mergeWith(units, periods, targetUnit);
  if (merged === undefined) {
    throw new Error("merge() returned undefined for non-empty input");
  }
  return merged;
}

describe.each(adapters)(
  "merge() days, months and hours with %s adapter",
  (_name, units) => {
    it("should merge days into a week", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const week = period(units, new Date("2024-01-15T00:00:00"), "week");
      const days = divideWith(units, week, "day");

      const mergedWeek = mergeOrFail(units, days, "week");
      expect(mergedWeek.unit).toBe("week");
      expect(mergedWeek.start.getTime()).toBe(week.start.getTime());
      expect(mergedWeek.end.getTime()).toBe(week.end.getTime());
    });

    it("should merge months into a year", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const year = period(units, new Date("2024-06-15T00:00:00"), "year");
      const months = divideWith(units, year, "month");

      const mergedYear = mergeOrFail(units, months, "year");
      expect(mergedYear.unit).toBe("year");
      expect(mergedYear.start.getFullYear()).toBe(YEAR_2024);
      expect(mergedYear.start.getMonth()).toBe(JANUARY);
      expect(mergedYear.end.getMonth()).toBe(DECEMBER);
    });

    it("should merge hours into a day", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const day = period(units, new Date("2024-01-15T00:00:00"), "day");
      const hours = divideWith(units, day, "hour");

      const mergedDay = mergeOrFail(units, hours, "day");
      expect(mergedDay.unit).toBe("day");
      expect(mergedDay.start.getDate()).toBe(DAY_15);
      expect(mergedDay.start.getHours()).toBe(MIDNIGHT);
      expect(mergedDay.end.getHours()).toBe(LAST_HOUR);
    });
  }
);

describe.each(adapters)(
  "merge() partial and non-contiguous periods with %s adapter",
  (_name, units) => {
    it("keeps no unit for a partial range", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const day = period(units, new Date("2024-01-15T00:00:00"), "day");
      const hours = divideWith(units, day, "hour");

      // Take only morning hours (0-11)
      const morningHours = hours.slice(MIDNIGHT, NOON);
      const mergedMorning = mergeOrFail(units, morningHours, "day");

      expect(mergedMorning.unit).toBe("custom");
      expect(mergedMorning.start.getHours()).toBe(MIDNIGHT);
      expect(mergedMorning.end.getHours()).toBe(LAST_MORNING_HOUR);
      expect(mergedMorning.end.getMinutes()).toBe(LAST_MINUTE);
    });

    it("should handle non-contiguous periods", { timeout: 5000 }, () => {
      expect.hasAssertions();
      // Create periods for Monday, Wednesday, Friday
      const monday = period(units, new Date("2024-01-08T00:00:00"), "day");
      const wednesday = period(units, new Date("2024-01-10T00:00:00"), "day");
      const friday = period(units, new Date("2024-01-12T00:00:00"), "day");

      const merged = mergeOrFail(units, [monday, wednesday, friday], "week");

      expect(merged.unit).toBe("custom");
      expect(merged.start.getTime()).toBeLessThanOrEqual(
        monday.start.getTime()
      );
      expect(merged.end.getTime()).toBeGreaterThanOrEqual(friday.end.getTime());
    });
  }
);

describe.each(adapters)(
  "merge() minutes, seconds and trivial input with %s adapter",
  (_name, units) => {
    it("should merge minutes into an hour", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const hour = period(units, new Date("2024-01-15T14:00:00"), "hour");
      const minutes = divideWith(units, hour, "minute");

      const mergedHour = mergeOrFail(units, minutes, "hour");
      expect(mergedHour.unit).toBe("hour");
      expect(mergedHour.start.getHours()).toBe(TWO_PM);
      expect(mergedHour.start.getMinutes()).toBe(ZERO);
      expect(mergedHour.end.getMinutes()).toBe(LAST_MINUTE);
    });

    it("should merge seconds into a minute", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const minute = period(units, new Date("2024-01-15T14:30:00"), "minute");
      const seconds = divideWith(units, minute, "second");

      const mergedMinute = mergeOrFail(units, seconds, "minute");
      expect(mergedMinute.unit).toBe("minute");
      expect(mergedMinute.start.getMinutes()).toBe(HALF_HOUR_MINUTE);
      expect(mergedMinute.start.getSeconds()).toBe(ZERO);
      expect(mergedMinute.end.getSeconds()).toBe(LAST_SECOND);
    });

    it("keeps no unit for a day merged as a week", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const day = period(units, new Date("2024-01-15T00:00:00"), "day");

      const mergedWeek = mergeOrFail(units, [day], "week");
      expect(mergedWeek.unit).toBe("custom");
      expect(mergedWeek.start.getTime()).toBe(day.start.getTime());
      expect(mergedWeek.end.getTime()).toBe(day.end.getTime());
    });

    it("should return undefined for an empty array", { timeout: 5000 }, () => {
      expect.hasAssertions();
      expect(mergeWith(units, [], "day")).toBeUndefined();
    });
  }
);

describe.each(adapters)(
  "merge() across boundaries with %s adapter",
  (_name, units) => {
    it("should merge across boundaries", { timeout: 5000 }, () => {
      expect.hasAssertions();
      // Create days spanning month boundary
      const lastDayOfJan = period(
        units,
        new Date("2024-01-31T00:00:00"),
        "day"
      );
      const firstDayOfFeb = period(
        units,
        new Date("2024-02-01T00:00:00"),
        "day"
      );
      const secondDayOfFeb = period(
        units,
        new Date("2024-02-02T00:00:00"),
        "day"
      );

      const merged = mergeOrFail(
        units,
        [lastDayOfJan, firstDayOfFeb, secondDayOfFeb],
        "month"
      );

      expect(merged.unit).toBe("custom");
      expect(merged.start.getTime()).toBeLessThanOrEqual(
        lastDayOfJan.start.getTime()
      );
      expect(merged.end.getTime()).toBeGreaterThanOrEqual(
        secondDayOfFeb.end.getTime()
      );
    });
  }
);

describe.each(adapters)(
  "merge() without auto-detection with %s adapter",
  (_name, units) => {
    it(
      "should not detect week from 7 non-consecutive days",
      { timeout: 5000 },
      () => {
        expect.hasAssertions();
        // 6 consecutive days + 1 day from a different week
        const days = [
          // Mon
          period(units, new Date("2024-01-08T00:00:00"), "day"),
          // Tue
          period(units, new Date("2024-01-09T00:00:00"), "day"),
          // Wed
          period(units, new Date("2024-01-10T00:00:00"), "day"),
          // Thu
          period(units, new Date("2024-01-11T00:00:00"), "day"),
          // Fri
          period(units, new Date("2024-01-12T00:00:00"), "day"),
          // Sat
          period(units, new Date("2024-01-13T00:00:00"), "day"),
          // Next Sun (gap!)
          period(units, new Date("2024-01-21T00:00:00"), "day"),
        ];

        const merged = mergeOrFail(units, days);
        expect(merged.unit).toBe("custom");
      }
    );

    it(
      "should not detect quarter from 3 months in different years",
      { timeout: 5000 },
      () => {
        expect.hasAssertions();
        const months = [
          // Jan 2023
          period(units, new Date("2023-01-15T00:00:00"), "month"),
          // Feb 2024
          period(units, new Date("2024-02-15T00:00:00"), "month"),
          // Mar 2025
          period(units, new Date("2025-03-15T00:00:00"), "month"),
        ];

        const merged = mergeOrFail(units, months);
        expect(merged.unit).toBe("custom");
      }
    );
  }
);

describe.each(adapters)(
  "merge() type and reference date with %s adapter",
  (_name, units) => {
    it(
      "should not auto-promote 3 consecutive months to quarter",
      { timeout: 5000 },
      () => {
        expect.hasAssertions();
        const months = [
          // Jan 2024
          period(units, new Date("2024-01-15T00:00:00"), "month"),
          // Feb 2024
          period(units, new Date("2024-02-15T00:00:00"), "month"),
          // Mar 2024
          period(units, new Date("2024-03-15T00:00:00"), "month"),
        ];

        const merged = mergeOrFail(units, months);
        expect(merged.unit).toBe("custom");
      }
    );

    it(
      "should preserve reference date from first period",
      { timeout: 5000 },
      () => {
        expect.hasAssertions();
        const first = period(units, new Date("2024-01-10T00:00:00"), "day");
        const periods = [
          first,
          period(units, new Date("2024-01-11T00:00:00"), "day"),
          period(units, new Date("2024-01-12T00:00:00"), "day"),
        ];

        const merged = mergeOrFail(units, periods, "week");

        // Reference date should come from the first period
        expect(merged.start.getTime()).toBe(first.start.getTime());
      }
    );
  }
);
