import { describe, it, expect } from "vitest";
import { difference } from "./difference";
import { derivePeriod as period, createPeriod } from "./period";
import { withAllAdapters } from "../test/shared-adapter-tests";

withAllAdapters("difference", (adapter) => {
  describe("difference between two periods", () => {
    it("should calculate difference between two non-overlapping periods", () => {
      const jan = period(adapter, new Date(2024, 0, 15), "month");
      const march = period(adapter, new Date(2024, 2, 15), "month");

      const diff = difference(adapter, jan, march);

      expect(diff.type).toBe("custom");
      // Should be the gap between Jan 31 and March 1 (February)
      expect(diff.start.getTime()).toBe(jan.end.getTime() + 1);
      expect(diff.end.getTime()).toBe(march.start.getTime() - 1);
    });

    it("should calculate difference between two dates", () => {
      const date1 = new Date(2024, 0, 1); // Jan 1
      const date2 = new Date(2024, 0, 10); // Jan 10

      const diff = difference(adapter, date1, date2);

      expect(diff.type).toBe("custom");
      expect(diff.start.getTime()).toBe(date1.getTime());
      expect(diff.end.getTime()).toBe(date2.getTime());
    });

    it("should handle period to date", () => {
      const jan = period(adapter, new Date(2024, 0, 15), "month");
      const feb15 = new Date(2024, 1, 15);

      const diff = difference(adapter, jan, feb15);

      expect(diff.type).toBe("custom");
      expect(diff.start.getTime()).toBe(jan.end.getTime() + 1);
      expect(diff.end.getTime()).toBe(feb15.getTime());
    });

    it("should handle date to period", () => {
      const jan15 = new Date(2024, 0, 15);
      const march = period(adapter, new Date(2024, 2, 15), "month");

      const diff = difference(adapter, jan15, march);

      expect(diff.type).toBe("custom");
      expect(diff.start.getTime()).toBe(jan15.getTime());
      expect(diff.end.getTime()).toBe(march.start.getTime() - 1);
    });

    it("should handle reversed order (to < from)", () => {
      const march = period(adapter, new Date(2024, 2, 15), "month");
      const jan = period(adapter, new Date(2024, 0, 15), "month");

      const diff = difference(adapter, march, jan);

      expect(diff.type).toBe("custom");
      // Should reverse: from March start back to Jan end
      expect(diff.start.getTime()).toBe(march.start.getTime());
      expect(diff.end.getTime()).toBe(jan.end.getTime());
      // End should be before start (negative duration)
      expect(diff.end.getTime()).toBeLessThan(diff.start.getTime());
    });

    it("should handle touching periods (no gap)", () => {
      const jan = period(adapter, new Date(2024, 0, 15), "month");
      const feb = period(adapter, new Date(2024, 1, 15), "month");

      const diff = difference(adapter, jan, feb);

      expect(diff.type).toBe("custom");
      // Gap should be exactly 1 millisecond (from jan.end+1 to feb.start-1)
      // But feb.start should be jan.end + 1, so gap is empty
      expect(diff.start.getTime()).toBe(jan.end.getTime() + 1);
      expect(diff.end.getTime()).toBe(feb.start.getTime() - 1);
      // This means end < start (zero or negative duration)
      expect(diff.end.getTime()).toBeLessThan(diff.start.getTime());
    });

    it("should handle overlapping periods", () => {
      const period1 = period(adapter, new Date(2024, 0, 15), "month"); // All of January
      const period2 = createPeriod(
        new Date(2024, 0, 20),
        new Date(2024, 1, 10) // Jan 20 - Feb 10
      );

      const diff = difference(adapter, period1, period2);

      expect(diff.type).toBe("custom");
      // Gap from end of period1 to start of period2
      expect(diff.start.getTime()).toBe(period1.end.getTime() + 1);
      expect(diff.end.getTime()).toBe(period2.start.getTime() - 1);
      // Since they overlap, end will be before start
      expect(diff.end.getTime()).toBeLessThan(diff.start.getTime());
    });

    it("should handle same date/period (zero duration)", () => {
      const date = new Date(2024, 0, 15);

      const diff = difference(adapter, date, date);

      expect(diff.type).toBe("custom");
      expect(diff.start.getTime()).toBe(date.getTime());
      expect(diff.end.getTime()).toBe(date.getTime());
    });

    it("should handle same period", () => {
      const jan = period(adapter, new Date(2024, 0, 15), "month");

      const diff = difference(adapter, jan, jan);

      expect(diff.type).toBe("custom");
      // From end+1 to start-1 of same period = negative
      expect(diff.start.getTime()).toBe(jan.end.getTime() + 1);
      expect(diff.end.getTime()).toBe(jan.start.getTime() - 1);
      expect(diff.end.getTime()).toBeLessThan(diff.start.getTime());
    });

    it("should return period spanning the two dates", () => {
      const date1 = new Date(2024, 0, 1);
      const date2 = new Date(2024, 0, 10);

      const diff = difference(adapter, date1, date2);

      expect(diff.start.getTime()).toBe(date1.getTime());
      expect(diff.end.getTime()).toBe(date2.getTime());
    });

    it("should handle different time units", () => {
      const week1 = period(adapter, new Date(2024, 0, 8), "week");
      const week3 = period(adapter, new Date(2024, 0, 22), "week");

      const diff = difference(adapter, week1, week3);

      expect(diff.type).toBe("custom");
      // Should be the gap between week1 and week3 (week2)
      expect(diff.start.getTime()).toBe(week1.end.getTime() + 1);
      expect(diff.end.getTime()).toBe(week3.start.getTime() - 1);
    });

    it("should handle custom periods", () => {
      const custom1 = createPeriod(new Date(2024, 0, 1), new Date(2024, 0, 10));
      const custom2 = createPeriod(
        new Date(2024, 0, 20),
        new Date(2024, 0, 31)
      );

      const diff = difference(adapter, custom1, custom2);

      expect(diff.type).toBe("custom");
      // Gap from Jan 10 end to Jan 20 start
      expect(diff.start.getTime()).toBe(custom1.end.getTime() + 1);
      expect(diff.end.getTime()).toBe(custom2.start.getTime() - 1);
    });

    it("should handle hour periods", () => {
      const hour1 = period(adapter, new Date(2024, 0, 15, 10), "hour");
      const hour3 = period(adapter, new Date(2024, 0, 15, 12), "hour");

      const diff = difference(adapter, hour1, hour3);

      expect(diff.type).toBe("custom");
      // Should be the gap (hour 11)
      expect(diff.start.getTime()).toBe(hour1.end.getTime() + 1);
      expect(diff.end.getTime()).toBe(hour3.start.getTime() - 1);
    });

    it("should handle minute periods", () => {
      const min1 = period(adapter, new Date(2024, 0, 15, 10, 0), "minute");
      const min5 = period(adapter, new Date(2024, 0, 15, 10, 4), "minute");

      const diff = difference(adapter, min1, min5);

      expect(diff.type).toBe("custom");
      // Should be the gap (minutes 1-3)
      expect(diff.start.getTime()).toBe(min1.end.getTime() + 1);
      expect(diff.end.getTime()).toBe(min5.start.getTime() - 1);
    });

    it("should normalize reversed date-to-date so start <= end", () => {
      const later = new Date(2024, 0, 10);
      const earlier = new Date(2024, 0, 1);

      const diff = difference(adapter, later, earlier);

      expect(diff.type).toBe("custom");
      expect(diff.start.getTime()).toBe(earlier.getTime());
      expect(diff.end.getTime()).toBe(later.getTime());
    });

    it("should handle year periods with large gaps", () => {
      const year2020 = period(adapter, new Date(2020, 0, 15), "year");
      const year2024 = period(adapter, new Date(2024, 0, 15), "year");

      const diff = difference(adapter, year2020, year2024);

      expect(diff.type).toBe("custom");
      // Should span 2021-2023
      expect(diff.start.getTime()).toBe(year2020.end.getTime() + 1);
      expect(diff.end.getTime()).toBe(year2024.start.getTime() - 1);
      expect(diff.start.getFullYear()).toBe(2021);
      expect(diff.end.getFullYear()).toBe(2023);
    });
  });
});
