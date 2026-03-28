import { describe, it, expect } from "vitest";
import { merge } from "./merge";
import { divide } from "./divide";
import { derivePeriod as period } from "./period";
import { withAllAdapters } from "../test/shared-adapter-tests";

withAllAdapters("merge", (adapter) => {
  describe("period merging", () => {
    it("should merge days into a week", () => {
      const week = period(adapter, new Date(2024, 0, 15), "week");
      const days = divide(adapter, week, "day");

      const mergedWeek = merge(adapter, days, "week");
      expect(mergedWeek.type).toBe("week");
      expect(mergedWeek.start.getTime()).toBe(week.start.getTime());
      expect(mergedWeek.end.getTime()).toBe(week.end.getTime());
    });

    it("should merge months into a year", () => {
      const year = period(adapter, new Date(2024, 5, 15), "year");
      const months = divide(adapter, year, "month");

      const mergedYear = merge(adapter, months, "year");
      expect(mergedYear.type).toBe("year");
      expect(mergedYear.start.getFullYear()).toBe(2024);
      expect(mergedYear.start.getMonth()).toBe(0);
      expect(mergedYear.end.getMonth()).toBe(11);
    });

    it("should merge hours into a day", () => {
      const day = period(adapter, new Date(2024, 0, 15), "day");
      const hours = divide(adapter, day, "hour");

      const mergedDay = merge(adapter, hours, "day");
      expect(mergedDay.type).toBe("day");
      expect(mergedDay.start.getDate()).toBe(15);
      expect(mergedDay.start.getHours()).toBe(0);
      expect(mergedDay.end.getHours()).toBe(23);
    });

    it("should merge partial periods", () => {
      const day = period(adapter, new Date(2024, 0, 15), "day");
      const hours = divide(adapter, day, "hour");

      // Take only morning hours (0-11)
      const morningHours = hours.slice(0, 12);
      const mergedMorning = merge(adapter, morningHours, "day");

      expect(mergedMorning.type).toBe("day");
      expect(mergedMorning.start.getHours()).toBe(0);
      expect(mergedMorning.end.getHours()).toBe(11);
      expect(mergedMorning.end.getMinutes()).toBe(59);
    });

    it("should handle non-contiguous periods", () => {
      // Create periods for Monday, Wednesday, Friday
      const monday = period(adapter, new Date(2024, 0, 8), "day");
      const wednesday = period(adapter, new Date(2024, 0, 10), "day");
      const friday = period(adapter, new Date(2024, 0, 12), "day");

      const merged = merge(adapter, [monday, wednesday, friday], "week");

      expect(merged.type).toBe("week");
      // Should span from Monday to Friday's week
      expect(merged.start.getTime()).toBeLessThanOrEqual(
        monday.start.getTime()
      );
      expect(merged.end.getTime()).toBeGreaterThanOrEqual(friday.end.getTime());
    });

    it("should merge minutes into an hour", () => {
      const hour = period(adapter, new Date(2024, 0, 15, 14), "hour");
      const minutes = divide(adapter, hour, "minute");

      const mergedHour = merge(adapter, minutes, "hour");
      expect(mergedHour.type).toBe("hour");
      expect(mergedHour.start.getHours()).toBe(14);
      expect(mergedHour.start.getMinutes()).toBe(0);
      expect(mergedHour.end.getMinutes()).toBe(59);
    });

    it("should merge seconds into a minute", () => {
      const minute = period(adapter, new Date(2024, 0, 15, 14, 30), "minute");
      const seconds = divide(adapter, minute, "second");

      const mergedMinute = merge(adapter, seconds, "minute");
      expect(mergedMinute.type).toBe("minute");
      expect(mergedMinute.start.getMinutes()).toBe(30);
      expect(mergedMinute.start.getSeconds()).toBe(0);
      expect(mergedMinute.end.getSeconds()).toBe(59);
    });

    it("should handle single period merge", () => {
      const day = period(adapter, new Date(2024, 0, 15), "day");

      const mergedWeek = merge(adapter, [day], "week");
      expect(mergedWeek.type).toBe("week");
      // The week should contain the day
      expect(mergedWeek.start.getTime()).toBeLessThanOrEqual(
        day.start.getTime()
      );
      expect(mergedWeek.end.getTime()).toBeGreaterThanOrEqual(
        day.end.getTime()
      );
    });

    it("should throw on empty array", () => {
      expect(() => merge(adapter, [], "day")).toThrow(
        "merge() requires at least one period"
      );
    });

    it("should merge across boundaries", () => {
      // Create days spanning month boundary
      const lastDayOfJan = period(adapter, new Date(2024, 0, 31), "day");
      const firstDayOfFeb = period(adapter, new Date(2024, 1, 1), "day");
      const secondDayOfFeb = period(adapter, new Date(2024, 1, 2), "day");

      const merged = merge(
        adapter,
        [lastDayOfJan, firstDayOfFeb, secondDayOfFeb],
        "month"
      );

      // Should create a month period that contains all days
      expect(merged.type).toBe("month");
      // The exact month depends on the merge algorithm
      expect(merged.start.getTime()).toBeLessThanOrEqual(
        lastDayOfJan.start.getTime()
      );
      expect(merged.end.getTime()).toBeGreaterThanOrEqual(
        secondDayOfFeb.end.getTime()
      );
    });

    it("should not detect week from 7 non-consecutive days", () => {
      // 6 consecutive days + 1 day from a different week
      const days = [
        period(adapter, new Date(2024, 0, 8), "day"), // Mon
        period(adapter, new Date(2024, 0, 9), "day"), // Tue
        period(adapter, new Date(2024, 0, 10), "day"), // Wed
        period(adapter, new Date(2024, 0, 11), "day"), // Thu
        period(adapter, new Date(2024, 0, 12), "day"), // Fri
        period(adapter, new Date(2024, 0, 13), "day"), // Sat
        period(adapter, new Date(2024, 0, 21), "day"), // Next Sun (gap!)
      ];

      const merged = merge(adapter, days);
      expect(merged.type).toBe("custom");
    });

    it("should not detect quarter from 3 months in different years", () => {
      const months = [
        period(adapter, new Date(2023, 0, 15), "month"), // Jan 2023
        period(adapter, new Date(2024, 1, 15), "month"), // Feb 2024
        period(adapter, new Date(2025, 2, 15), "month"), // Mar 2025
      ];

      const merged = merge(adapter, months);
      expect(merged.type).toBe("custom");
    });

    it("should detect quarter from 3 consecutive months in same year", () => {
      const months = [
        period(adapter, new Date(2024, 0, 15), "month"), // Jan 2024
        period(adapter, new Date(2024, 1, 15), "month"), // Feb 2024
        period(adapter, new Date(2024, 2, 15), "month"), // Mar 2024
      ];

      const merged = merge(adapter, months);
      expect(merged.type).toBe("quarter");
    });

    it("should preserve reference date from first period", () => {
      const periods = [
        period(adapter, new Date(2024, 0, 10), "day"),
        period(adapter, new Date(2024, 0, 11), "day"),
        period(adapter, new Date(2024, 0, 12), "day"),
      ];

      const merged = merge(adapter, periods, "week");

      // Reference date should come from the first period
      expect(merged.start.getTime()).toBe(periods[0].start.getTime());
    });
  });
});
