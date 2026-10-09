import { describe, expect, it } from "vitest";
import type { Period } from "#src/types";
import { getUnitsTestCases } from "#src/test/shared-adapter-tests";
import { periodWith as period } from "./period";
import { split } from "./split";

const JANUARY = 0;
const JULY = 6;
const DECEMBER = 11;
const HALF_HOUR_MINUTE = 30;
const LAST_MINUTE = 59;
const HALF_SECOND_MS = 500;
const LAST_MS = 999;
const ZERO = 0;
const MAX_GAP_MS = 1;

const adapters = getUnitsTestCases();

/**
 * Split at a date known to be inside the period.
 *
 * @param whole - The period to split
 * @param date - A date after the start and within the period
 * @returns Both parts
 */
function splitOrFail(whole: Period, date: Readonly<Date>): [Period, Period] {
  const parts = split(whole, date);
  if (parts === undefined) {
    throw new Error("split() returned undefined for a date inside the period");
  }
  return parts;
}

describe.each(adapters)(
  "split() at boundaries with %s adapter",
  (_name, units) => {
    it("should split a period at specific date", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const month = period(units, new Date("2024-01-15T00:00:00"), "month");
      const splitDate = new Date("2024-01-15T12:00:00");

      const [before, after] = splitOrFail(month, splitDate);

      expect(before.start.getTime()).toBe(month.start.getTime());
      expect(before.end.getTime()).toBeLessThan(splitDate.getTime());
      expect(after.start.getTime()).toBeGreaterThanOrEqual(splitDate.getTime());
      expect(after.end.getTime()).toBe(month.end.getTime());
    });

    it("returns undefined at or before the start", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const day = period(units, new Date("2024-01-15T00:00:00"), "day");
      expect(split(day, day.start)).toBeUndefined();
      expect(split(day, new Date("2024-01-14T00:00:00"))).toBeUndefined();
    });

    it("returns undefined after the end", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const day = period(units, new Date("2024-01-15T00:00:00"), "day");
      const justAfter = new Date(day.end.getTime() + MAX_GAP_MS);
      expect(split(day, justAfter)).toBeUndefined();
      expect(split(day, new Date("2027-01-01T00:00:00"))).toBeUndefined();
    });

    it("splits off the last millisecond at the end", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const week = period(units, new Date("2024-01-15T00:00:00"), "week");
      const [before, after] = splitOrFail(week, week.end);
      expect(before.end.getTime()).toBe(week.end.getTime() - MAX_GAP_MS);
      expect(after.start.getTime()).toBe(week.end.getTime());
      expect(after.end.getTime()).toBe(week.end.getTime());
    });
  }
);

describe.each(adapters)(
  "split() calendar units with %s adapter",
  (_name, units) => {
    it("should split year in half", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const year = period(units, new Date("2024-01-01T00:00:00"), "year");
      // July 1
      const midYear = new Date("2024-07-01T00:00:00");

      const [firstHalf, secondHalf] = splitOrFail(year, midYear);

      expect(firstHalf.start.getMonth()).toBe(JANUARY);
      expect(firstHalf.end.getMonth()).toBeLessThan(JULY);
      // July or later
      expect(secondHalf.start.getMonth()).toBeGreaterThanOrEqual(JULY);
      expect(secondHalf.end.getMonth()).toBe(DECEMBER);
    });

    it("should split hour at 30 minutes", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const hour = period(units, new Date("2024-01-15T14:00:00"), "hour");
      const halfHour = new Date("2024-01-15T14:30:00");

      const [firstHalf, secondHalf] = splitOrFail(hour, halfHour);

      expect(firstHalf.start.getMinutes()).toBe(ZERO);
      expect(firstHalf.end.getMinutes()).toBeLessThan(HALF_HOUR_MINUTE);
      expect(secondHalf.start.getMinutes()).toBeGreaterThanOrEqual(
        HALF_HOUR_MINUTE
      );
      expect(secondHalf.end.getMinutes()).toBe(LAST_MINUTE);
    });

    it("should handle millisecond precision", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const second = period(units, new Date("2024-01-15T14:30:45"), "second");
      const splitMs = new Date("2024-01-15T14:30:45.500");

      const [before, after] = splitOrFail(second, splitMs);

      expect(before.start.getMilliseconds()).toBe(ZERO);
      expect(before.end.getMilliseconds()).toBeLessThan(HALF_SECOND_MS);
      expect(after.start.getMilliseconds()).toBeGreaterThanOrEqual(
        HALF_SECOND_MS
      );
      expect(after.end.getMilliseconds()).toBe(LAST_MS);
    });
  }
);

describe.each(adapters)(
  "split() edge cases with %s adapter",
  (_name, units) => {
    it(
      "returns custom parts: half a month is no month",
      { timeout: 5000 },
      () => {
        expect.hasAssertions();
        const month = period(units, new Date("2024-01-15T00:00:00"), "month");
        const splitDate = new Date("2024-01-20T00:00:00");

        const [before, after] = splitOrFail(month, splitDate);

        expect(before.unit).toBe("custom");
        expect(after.unit).toBe("custom");
      }
    );
  }
);

describe.each(adapters)(
  "split() custom periods with %s adapter",
  (_name, units) => {
    it("should split custom period", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const customPeriod = {
        end: new Date("2024-01-20T18:00:00"),
        start: new Date("2024-01-10T10:00:00"),
        unit: "custom" as const,
      };

      const splitDate = new Date("2024-01-15T14:00:00");
      const [before, after] = splitOrFail(customPeriod, splitDate);

      expect(before.start.getTime()).toBe(customPeriod.start.getTime());
      expect(before.end.getTime()).toBeLessThan(splitDate.getTime());
      expect(after.start.getTime()).toBeGreaterThanOrEqual(splitDate.getTime());
      expect(after.end.getTime()).toBe(customPeriod.end.getTime());
    });

    it("should maintain split point consistency", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const week = period(units, new Date("2024-01-15T00:00:00"), "week");
      const wednesday = new Date("2024-01-17T12:00:00");

      const [before, after] = splitOrFail(week, wednesday);

      // The split parts should be contiguous
      const gap = after.start.getTime() - before.end.getTime();
      expect(gap).toBeGreaterThanOrEqual(ZERO);
      // At most 1ms gap
      expect(gap).toBeLessThanOrEqual(MAX_GAP_MS);
    });
  }
);
