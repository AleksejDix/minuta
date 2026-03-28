import { describe, it, expect } from "vitest";

import { createNativeAdapter } from "../../adapters/native";
import { merge } from "../../operations/merge";
import { go } from "../../operations/go";
import { derivePeriod as period } from "../../operations/period";
import { divide } from "../../operations/divide";

describe("regression tests for critical bugs", () => {
  const adapter = createNativeAdapter();

  describe("merge() regression tests", () => {
    it("should throw on empty array (bug #1)", () => {
      expect(() => merge(adapter, [], "day")).toThrow(
        "merge() requires at least one period"
      );
    });

    it("should promote single period to target unit (bug #2)", () => {
      // Previously returned the original period unchanged
      const day = period(adapter, new Date(2024, 0, 15), "day");

      const promotedWeek = merge(adapter, [day], "week");
      expect(promotedWeek.type).toBe("week");
      expect(promotedWeek.start.getTime()).toBeLessThanOrEqual(
        day.start.getTime()
      );
      expect(promotedWeek.end.getTime()).toBeGreaterThanOrEqual(
        day.end.getTime()
      );

      const promotedMonth = merge(adapter, [day], "month");
      expect(promotedMonth.type).toBe("month");
      expect(promotedMonth.start.getDate()).toBe(1);
    });

    it("should preserve exact start/end times for partial period merges", () => {
      // Regression test for partial period handling
      const day = period(adapter, new Date(2024, 0, 15), "day");
      const hours = divide(adapter, day, "hour");

      // Merge morning hours only (0-11)
      const morningHours = hours.slice(0, 12);
      const merged = merge(adapter, morningHours, "day");

      expect(merged.type).toBe("day");
      expect(merged.start.getHours()).toBe(0);
      expect(merged.end.getHours()).toBe(11);
      expect(merged.end.getMinutes()).toBe(59);
    });

    it("should preserve reference date from first period", () => {
      // Regression test for reference date preservation
      const periods = [
        period(adapter, new Date(2024, 0, 10), "day"),
        period(adapter, new Date(2024, 0, 11), "day"),
        period(adapter, new Date(2024, 0, 12), "day"),
      ];

      const merged = merge(adapter, periods, "week");
      expect(merged.start.getTime()).toBe(periods[0].start.getTime());
    });
  });

  describe("go() regression tests", () => {
    it("should add exact days without year-based shortcuts", () => {
      // 2024 is a leap year (366 days), so 365 days from Jan 1 = Dec 31
      const startDay = period(adapter, new Date(2024, 0, 1), "day");

      const result365 = go(adapter, startDay, 365);
      expect(result365.start.getFullYear()).toBe(2024);
      expect(result365.start.getMonth()).toBe(11); // December
      expect(result365.start.getDate()).toBe(31);

      // 366 days from Jan 1, 2024 = Jan 1, 2025
      const result366 = go(adapter, startDay, 366);
      expect(result366.start.getFullYear()).toBe(2025);
      expect(result366.start.getMonth()).toBe(0);
      expect(result366.start.getDate()).toBe(1);
    });

    it("should handle multiple year navigation correctly", () => {
      // 2023 is not a leap year (365 days), so 365 days = Jan 1, 2024
      const startDay = period(adapter, new Date(2023, 0, 1), "day");
      const oneYear = go(adapter, startDay, 365);
      expect(oneYear.start.getFullYear()).toBe(2024);
      expect(oneYear.start.getMonth()).toBe(0);
      expect(oneYear.start.getDate()).toBe(1);

      // Then 2024 is a leap year, so another 365 days = Dec 31, 2024
      const twoYears = go(adapter, oneYear, 365);
      expect(twoYears.start.getFullYear()).toBe(2024);
      expect(twoYears.start.getMonth()).toBe(11);
      expect(twoYears.start.getDate()).toBe(31);
    });

    it("should handle negative large day offsets", () => {
      // 2024 is a leap year, so going back 365 days from Jan 1, 2025
      // lands on Jan 2, 2024 (not Jan 1, because 2024 has 366 days)
      const startDay = period(adapter, new Date(2025, 0, 1), "day");
      const yearBefore = go(adapter, startDay, -365);
      expect(yearBefore.start.getFullYear()).toBe(2024);
      expect(yearBefore.start.getMonth()).toBe(0);
      expect(yearBefore.start.getDate()).toBe(2);
    });

    it("should handle leap year boundary crossing", () => {
      // Feb 29, 2024 + 365 days = Feb 28, 2025 (exact day math)
      const feb29 = period(adapter, new Date(2024, 1, 29), "day");
      const nextYear = go(adapter, feb29, 365);
      expect(nextYear.start.getFullYear()).toBe(2025);
      expect(nextYear.start.getMonth()).toBe(1); // February
      expect(nextYear.start.getDate()).toBe(28);

      // Dec 31, 2023 + 365 days = Dec 30, 2024 (2024 is leap year)
      const dec31 = period(adapter, new Date(2023, 11, 31), "day");
      const afterYear = go(adapter, dec31, 365);
      expect(afterYear.start.getFullYear()).toBe(2024);
      expect(afterYear.start.getMonth()).toBe(11);
      expect(afterYear.start.getDate()).toBe(30);
    });
  });
});
