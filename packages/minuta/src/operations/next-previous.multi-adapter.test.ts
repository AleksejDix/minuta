import { describe, it, expect } from "vitest";
import { next, previous } from "./index";
import { derivePeriod as period } from "./period";
import { withAllAdapters } from "../test/shared-adapter-tests";

withAllAdapters("next/previous", (adapter) => {
  describe("next operation", () => {
    it("should get next day", () => {
      const day = period(adapter, new Date(2024, 0, 15), "day");
      const nextDay = next(adapter, day);

      expect(nextDay.type).toBe("day");
      expect(nextDay.start.getDate()).toBe(16);
      expect(nextDay.start.getMonth()).toBe(0);
    });

    it("should get next month", () => {
      const month = period(adapter, new Date(2024, 0, 15), "month");
      const nextMonth = next(adapter, month);

      expect(nextMonth.type).toBe("month");
      expect(nextMonth.start.getMonth()).toBe(1); // February
      expect(nextMonth.start.getFullYear()).toBe(2024);
    });

    it("should get next year", () => {
      const year = period(adapter, new Date(2024, 5, 15), "year");
      const nextYear = next(adapter, year);

      expect(nextYear.type).toBe("year");
      expect(nextYear.start.getFullYear()).toBe(2025);
    });

    it("should handle month boundaries", () => {
      const lastDayOfMonth = period(adapter, new Date(2024, 0, 31), "day");
      const nextDay = next(adapter, lastDayOfMonth);

      expect(nextDay.start.getMonth()).toBe(1); // February
      expect(nextDay.start.getDate()).toBe(1);
    });

    it("should handle year boundaries", () => {
      const december = period(adapter, new Date(2023, 11, 15), "month");
      const january = next(adapter, december);

      expect(january.start.getFullYear()).toBe(2024);
      expect(january.start.getMonth()).toBe(0);
    });

    it("should get next hour", () => {
      const hour = period(adapter, new Date(2024, 0, 15, 14), "hour");
      const nextHour = next(adapter, hour);

      expect(nextHour.type).toBe("hour");
      expect(nextHour.start.getHours()).toBe(15);
    });

    it("should handle day boundary for hours", () => {
      const lastHour = period(adapter, new Date(2024, 0, 15, 23), "hour");
      const nextHour = next(adapter, lastHour);

      expect(nextHour.start.getDate()).toBe(16);
      expect(nextHour.start.getHours()).toBe(0);
    });
  });

  describe("previous operation", () => {
    it("should get previous day", () => {
      const day = period(adapter, new Date(2024, 0, 15), "day");
      const prevDay = previous(adapter, day);

      expect(prevDay.type).toBe("day");
      expect(prevDay.start.getDate()).toBe(14);
      expect(prevDay.start.getMonth()).toBe(0);
    });

    it("should get previous month", () => {
      const month = period(adapter, new Date(2024, 1, 15), "month");
      const prevMonth = previous(adapter, month);

      expect(prevMonth.type).toBe("month");
      expect(prevMonth.start.getMonth()).toBe(0); // January
      expect(prevMonth.start.getFullYear()).toBe(2024);
    });

    it("should get previous year", () => {
      const year = period(adapter, new Date(2024, 5, 15), "year");
      const prevYear = previous(adapter, year);

      expect(prevYear.type).toBe("year");
      expect(prevYear.start.getFullYear()).toBe(2023);
    });

    it("should handle month boundaries", () => {
      const firstDayOfMonth = period(adapter, new Date(2024, 1, 1), "day");
      const prevDay = previous(adapter, firstDayOfMonth);

      expect(prevDay.start.getMonth()).toBe(0); // January
      expect(prevDay.start.getDate()).toBe(31);
    });

    it("should handle year boundaries", () => {
      const january = period(adapter, new Date(2024, 0, 15), "month");
      const december = previous(adapter, january);

      expect(december.start.getFullYear()).toBe(2023);
      expect(december.start.getMonth()).toBe(11);
    });

    it("should get previous minute", () => {
      const minute = period(adapter, new Date(2024, 0, 15, 14, 30), "minute");
      const prevMinute = previous(adapter, minute);

      expect(prevMinute.type).toBe("minute");
      expect(prevMinute.start.getMinutes()).toBe(29);
    });

    it("should handle hour boundary for minutes", () => {
      const firstMinute = period(
        adapter,
        new Date(2024, 0, 15, 14, 0),
        "minute"
      );
      const prevMinute = previous(adapter, firstMinute);

      expect(prevMinute.start.getHours()).toBe(13);
      expect(prevMinute.start.getMinutes()).toBe(59);
    });
  });

  describe("next/previous consistency", () => {
    it("should be reversible operations", () => {
      const units = [
        "year",
        "month",
        "week",
        "day",
        "hour",
        "minute",
        "second",
      ] as const;
      const date = new Date(2024, 5, 15, 14, 30, 45);

      units.forEach((unit) => {
        const p = period(adapter, date, unit);
        const nextPeriod = next(adapter, p);
        const backToPeriod = previous(adapter, nextPeriod);

        expect(backToPeriod.type).toBe(p.type);
        expect(backToPeriod.start.getTime()).toBe(p.start.getTime());
        expect(backToPeriod.end.getTime()).toBe(p.end.getTime());
      });
    });

    it("should maintain period continuity", () => {
      const day = period(adapter, new Date(2024, 0, 15), "day");
      const nextDay = next(adapter, day);

      // End of current day should be just before start of next day
      const msBetween = nextDay.start.getTime() - day.end.getTime();
      expect(msBetween).toBe(1);
    });

    it("should handle week navigation correctly", () => {
      const week = period(adapter, new Date(2024, 0, 15), "week");
      const nextWeek = next(adapter, week);
      const prevWeek = previous(adapter, week);

      // Weeks should be exactly 7 days apart
      const nextDiff =
        (nextWeek.start.getTime() - week.start.getTime()) /
        (24 * 60 * 60 * 1000);
      const prevDiff =
        (week.start.getTime() - prevWeek.start.getTime()) /
        (24 * 60 * 60 * 1000);

      expect(nextDiff).toBe(7);
      expect(prevDiff).toBe(7);
    });
  });
});
