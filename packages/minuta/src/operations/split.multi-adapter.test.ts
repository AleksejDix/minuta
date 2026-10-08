import { describe, expect, it } from "vitest";
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

describe.each(adapters)(
  "split() at boundaries with %s adapter",
  (_name, units) => {
    it("should split a period at specific date", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const month = period(units, new Date("2024-01-15T00:00:00"), "month");
      const splitDate = new Date("2024-01-15T12:00:00");

      const [before, after] = split(month, splitDate);

      expect(before.start.getTime()).toBe(month.start.getTime());
      expect(before.end.getTime()).toBeLessThan(splitDate.getTime());
      expect(after.start.getTime()).toBeGreaterThanOrEqual(splitDate.getTime());
      expect(after.end.getTime()).toBe(month.end.getTime());
    });

    it("should handle split at period start", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const day = period(units, new Date("2024-01-15T00:00:00"), "day");
      const splitDate = day.start;

      const [before, after] = split(day, splitDate);

      // Before should be empty or minimal
      expect(before.start.getTime()).toBe(day.start.getTime());
      expect(before.end.getTime()).toBeLessThanOrEqual(day.start.getTime());

      // After should be the full period
      expect(after.start.getTime()).toBe(day.start.getTime());
      expect(after.end.getTime()).toBe(day.end.getTime());
    });

    it("should handle split at period end", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const week = period(units, new Date("2024-01-15T00:00:00"), "week");
      const splitDate = week.end;

      const [before, after] = split(week, splitDate);

      // Before should be the full period
      expect(before.start.getTime()).toBe(week.start.getTime());
      expect(before.end.getTime()).toBeLessThanOrEqual(week.end.getTime());

      // After should be empty or minimal
      expect(after.start.getTime()).toBeGreaterThanOrEqual(week.end.getTime());
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

      const [firstHalf, secondHalf] = split(year, midYear);

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

      const [firstHalf, secondHalf] = split(hour, halfHour);

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

      const [before, after] = split(second, splitMs);

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
    it("should handle split outside period", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const day = period(units, new Date("2024-01-15T00:00:00"), "day");
      const beforeDay = new Date("2024-01-14T00:00:00");
      const afterDay = new Date("2024-01-16T00:00:00");

      // Split before period
      const [, after1] = split(day, beforeDay);
      expect(after1.start.getTime()).toBe(day.start.getTime());
      expect(after1.end.getTime()).toBe(day.end.getTime());

      // Split after period
      const [before2] = split(day, afterDay);
      expect(before2.start.getTime()).toBe(day.start.getTime());
      expect(before2.end.getTime()).toBe(day.end.getTime());
    });

    it("should preserve period type", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const month = period(units, new Date("2024-01-15T00:00:00"), "month");
      const splitDate = new Date("2024-01-20T00:00:00");

      const [before, after] = split(month, splitDate);

      expect(before.unit).toBe("month");
      expect(after.unit).toBe("month");
    });
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
      const [before, after] = split(customPeriod, splitDate);

      expect(before.start.getTime()).toBe(customPeriod.start.getTime());
      expect(before.end.getTime()).toBeLessThan(splitDate.getTime());
      expect(after.start.getTime()).toBeGreaterThanOrEqual(splitDate.getTime());
      expect(after.end.getTime()).toBe(customPeriod.end.getTime());
    });

    it("should maintain split point consistency", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const week = period(units, new Date("2024-01-15T00:00:00"), "week");
      const wednesday = new Date("2024-01-17T12:00:00");

      const [before, after] = split(week, wednesday);

      // The split parts should be contiguous
      const gap = after.start.getTime() - before.end.getTime();
      expect(gap).toBeGreaterThanOrEqual(ZERO);
      // At most 1ms gap
      expect(gap).toBeLessThanOrEqual(MAX_GAP_MS);
    });
  }
);
