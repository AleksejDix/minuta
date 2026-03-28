import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { isToday, isWeekday, isWeekend } from "./utils";
import { derivePeriod as period } from "./period";
import { withAllAdapters } from "../test/shared-adapter-tests";

withAllAdapters("utils", (adapter) => {
  describe("isToday", () => {
    beforeEach(() => {
      // Mock current date to a known value
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2024, 0, 15, 10, 30)); // Monday, January 15, 2024
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should return true for today's date", () => {
      const today = new Date(2024, 0, 15, 14, 45); // Different time, same day
      const todayPeriod = period(adapter, today, "day");
      expect(isToday(adapter, new Date(2024, 0, 15, 10, 30), todayPeriod)).toBe(
        true
      );
    });

    it("should return false for yesterday", () => {
      const yesterday = new Date(2024, 0, 14);
      const yesterdayPeriod = period(adapter, yesterday, "day");
      expect(
        isToday(adapter, new Date(2024, 0, 15, 10, 30), yesterdayPeriod)
      ).toBe(false);
    });

    it("should return false for tomorrow", () => {
      const tomorrow = new Date(2024, 0, 16);
      const tomorrowPeriod = period(adapter, tomorrow, "day");
      expect(
        isToday(adapter, new Date(2024, 0, 15, 10, 30), tomorrowPeriod)
      ).toBe(false);
    });

    it("should return true for today period", () => {
      const todayPeriod = period(adapter, new Date(2024, 0, 15), "day");
      expect(isToday(adapter, new Date(2024, 0, 15, 10, 30), todayPeriod)).toBe(
        true
      );
    });

    it("should return false for yesterday period", () => {
      const yesterdayPeriod = period(adapter, new Date(2024, 0, 14), "day");
      expect(
        isToday(adapter, new Date(2024, 0, 15, 10, 30), yesterdayPeriod)
      ).toBe(false);
    });

    it("should handle periods that contain today", () => {
      const weekPeriod = period(adapter, new Date(2024, 0, 15), "week");
      const monthPeriod = period(adapter, new Date(2024, 0, 15), "month");
      const yearPeriod = period(adapter, new Date(2024, 0, 15), "year");

      // These periods contain today but aren't "today" periods
      expect(isToday(adapter, new Date(2024, 0, 15, 10, 30), weekPeriod)).toBe(
        false
      );
      expect(isToday(adapter, new Date(2024, 0, 15, 10, 30), monthPeriod)).toBe(
        false
      );
      expect(isToday(adapter, new Date(2024, 0, 15, 10, 30), yearPeriod)).toBe(
        false
      );
    });

    it("should handle edge of day correctly", () => {
      const startOfDay = new Date(2024, 0, 15, 0, 0, 0, 0);
      const endOfDay = new Date(2024, 0, 15, 23, 59, 59, 999);

      const startOfDayPeriod = period(adapter, startOfDay, "day");
      const endOfDayPeriod = period(adapter, endOfDay, "day");
      expect(
        isToday(adapter, new Date(2024, 0, 15, 10, 30), startOfDayPeriod)
      ).toBe(true);
      expect(
        isToday(adapter, new Date(2024, 0, 15, 10, 30), endOfDayPeriod)
      ).toBe(true);
    });
  });

  describe("isWeekday", () => {
    it("should return true for Monday through Friday", () => {
      const monday = new Date(2024, 0, 15); // Monday
      const tuesday = new Date(2024, 0, 16);
      const wednesday = new Date(2024, 0, 17);
      const thursday = new Date(2024, 0, 18);
      const friday = new Date(2024, 0, 19);

      const mondayPeriod = period(adapter, monday, "day");
      const tuesdayPeriod = period(adapter, tuesday, "day");
      const wednesdayPeriod = period(adapter, wednesday, "day");
      const thursdayPeriod = period(adapter, thursday, "day");
      const fridayPeriod = period(adapter, friday, "day");

      expect(isWeekday(mondayPeriod)).toBe(true);
      expect(isWeekday(tuesdayPeriod)).toBe(true);
      expect(isWeekday(wednesdayPeriod)).toBe(true);
      expect(isWeekday(thursdayPeriod)).toBe(true);
      expect(isWeekday(fridayPeriod)).toBe(true);
    });

    it("should return false for Saturday and Sunday", () => {
      const saturday = new Date(2024, 0, 20);
      const sunday = new Date(2024, 0, 21);

      const saturdayPeriod = period(adapter, saturday, "day");
      const sundayPeriod = period(adapter, sunday, "day");

      expect(isWeekday(saturdayPeriod)).toBe(false);
      expect(isWeekday(sundayPeriod)).toBe(false);
    });

    it("should handle periods correctly", () => {
      const mondayPeriod = period(adapter, new Date(2024, 0, 15), "day");
      const saturdayPeriod = period(adapter, new Date(2024, 0, 20), "day");

      expect(isWeekday(mondayPeriod)).toBe(true);
      expect(isWeekday(saturdayPeriod)).toBe(false);
    });

    it("should handle non-day periods", () => {
      const weekPeriod = period(adapter, new Date(2024, 0, 15), "week");
      const monthPeriod = period(adapter, new Date(2024, 0, 15), "month");

      // Week and month span both weekdays and weekends — neither is fully a weekday
      expect(isWeekday(weekPeriod)).toBe(false);
      expect(isWeekday(monthPeriod)).toBe(false);
    });
  });

  describe("isWeekend", () => {
    it("should return true for Saturday and Sunday", () => {
      const saturday = new Date(2024, 0, 20);
      const sunday = new Date(2024, 0, 21);

      const saturdayPeriod = period(adapter, saturday, "day");
      const sundayPeriod = period(adapter, sunday, "day");

      expect(isWeekend(saturdayPeriod)).toBe(true);
      expect(isWeekend(sundayPeriod)).toBe(true);
    });

    it("should return false for Monday through Friday", () => {
      const monday = new Date(2024, 0, 15);
      const tuesday = new Date(2024, 0, 16);
      const wednesday = new Date(2024, 0, 17);
      const thursday = new Date(2024, 0, 18);
      const friday = new Date(2024, 0, 19);

      const mondayPeriod = period(adapter, monday, "day");
      const tuesdayPeriod = period(adapter, tuesday, "day");
      const wednesdayPeriod = period(adapter, wednesday, "day");
      const thursdayPeriod = period(adapter, thursday, "day");
      const fridayPeriod = period(adapter, friday, "day");

      expect(isWeekend(mondayPeriod)).toBe(false);
      expect(isWeekend(tuesdayPeriod)).toBe(false);
      expect(isWeekend(wednesdayPeriod)).toBe(false);
      expect(isWeekend(thursdayPeriod)).toBe(false);
      expect(isWeekend(fridayPeriod)).toBe(false);
    });

    it("should handle periods correctly", () => {
      const saturdayPeriod = period(adapter, new Date(2024, 0, 20), "day");
      const mondayPeriod = period(adapter, new Date(2024, 0, 15), "day");

      expect(isWeekend(saturdayPeriod)).toBe(true);
      expect(isWeekend(mondayPeriod)).toBe(false);
    });
  });

  describe("consistency tests", () => {
    it("should be opposite of isWeekday", () => {
      const dates = [
        new Date(2024, 0, 15), // Monday
        new Date(2024, 0, 16), // Tuesday
        new Date(2024, 0, 17), // Wednesday
        new Date(2024, 0, 18), // Thursday
        new Date(2024, 0, 19), // Friday
        new Date(2024, 0, 20), // Saturday
        new Date(2024, 0, 21), // Sunday
      ];

      for (const date of dates) {
        const p = period(adapter, date, "day");
        expect(isWeekday(p)).toBe(!isWeekend(p));
      }
    });
  });

  describe("utils edge cases", () => {
    it("should handle different times on the same day", () => {
      const morning = new Date(2024, 0, 20, 6, 0); // Saturday morning
      const evening = new Date(2024, 0, 20, 20, 0); // Saturday evening

      const morningPeriod = period(adapter, morning, "day");
      const eveningPeriod = period(adapter, evening, "day");

      expect(isWeekend(morningPeriod)).toBe(true);
      expect(isWeekend(eveningPeriod)).toBe(true);
      expect(isWeekday(morningPeriod)).toBe(false);
      expect(isWeekday(eveningPeriod)).toBe(false);
    });

    it("should work with different period types", () => {
      const saturdayHour = period(adapter, new Date(2024, 0, 20, 14), "hour");
      const mondayMinute = period(
        adapter,
        new Date(2024, 0, 15, 14, 30),
        "minute"
      );

      expect(isWeekend(saturdayHour)).toBe(true);
      expect(isWeekday(mondayMinute)).toBe(true);
    });
  });
});
