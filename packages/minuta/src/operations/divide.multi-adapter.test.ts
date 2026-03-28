import { describe, it, expect } from "vitest";
import { divide } from "./divide";
import { derivePeriod as period } from "./period";
import { withAllAdapters } from "../test/shared-adapter-tests";

withAllAdapters("divide", (adapter) => {
  describe("period division", () => {
    it("should divide year into months", () => {
      const year = period(adapter, new Date(2024, 5, 15), "year");
      const months = divide(adapter, year, "month");

      expect(months).toHaveLength(12);
      expect(months[0].type).toBe("month");
      expect(months[0].start.getMonth()).toBe(0); // January
      expect(months[11].start.getMonth()).toBe(11); // December

      // Check continuity
      for (let i = 1; i < months.length; i++) {
        const prevEnd = months[i - 1].end.getTime();
        const currentStart = months[i].start.getTime();
        expect(currentStart).toBeGreaterThan(prevEnd);
      }
    });

    it("should divide month into days", () => {
      const february2024 = period(adapter, new Date(2024, 1, 15), "month");
      const days = divide(adapter, february2024, "day");

      expect(days).toHaveLength(29); // Leap year
      expect(days[0].start.getDate()).toBe(1);
      expect(days[28].start.getDate()).toBe(29);

      // All days should be in February
      days.forEach((day) => {
        expect(day.start.getMonth()).toBe(1);
        expect(day.type).toBe("day");
      });
    });

    it("should divide week into days", () => {
      const week = period(adapter, new Date(2024, 0, 15), "week");
      const days = divide(adapter, week, "day");

      expect(days).toHaveLength(7);

      // Check days are consecutive
      for (let i = 1; i < days.length; i++) {
        const prevDate = days[i - 1].start.getDate();
        const currentDate = days[i].start.getDate();
        const expectedDate = prevDate + 1;

        // Handle month boundary
        if (days[i].start.getMonth() !== days[i - 1].start.getMonth()) {
          expect(currentDate).toBe(1);
        } else {
          expect(currentDate).toBe(expectedDate);
        }
      }
    });

    it("should divide day into hours", () => {
      const day = period(adapter, new Date(2024, 0, 15), "day");
      const hours = divide(adapter, day, "hour");

      expect(hours).toHaveLength(24);
      expect(hours[0].start.getHours()).toBe(0);
      expect(hours[23].start.getHours()).toBe(23);

      // All hours should be on the same day
      hours.forEach((hour) => {
        expect(hour.start.getDate()).toBe(15);
        expect(hour.type).toBe("hour");
      });
    });

    it("should divide hour into minutes", () => {
      const hour = period(adapter, new Date(2024, 0, 15, 14), "hour");
      const minutes = divide(adapter, hour, "minute");

      expect(minutes).toHaveLength(60);
      expect(minutes[0].start.getMinutes()).toBe(0);
      expect(minutes[59].start.getMinutes()).toBe(59);

      // All minutes should be in the same hour
      minutes.forEach((minute) => {
        expect(minute.start.getHours()).toBe(14);
        expect(minute.type).toBe("minute");
      });
    });

    it("should divide minute into seconds", () => {
      const minute = period(adapter, new Date(2024, 0, 15, 14, 30), "minute");
      const seconds = divide(adapter, minute, "second");

      expect(seconds).toHaveLength(60);
      expect(seconds[0].start.getSeconds()).toBe(0);
      expect(seconds[59].start.getSeconds()).toBe(59);

      // All seconds should be in the same minute
      seconds.forEach((second) => {
        expect(second.start.getMinutes()).toBe(30);
        expect(second.type).toBe("second");
      });
    });

    it("should handle month boundaries when dividing", () => {
      // Create a week that spans month boundary
      const lastWeekOfJan = period(adapter, new Date(2024, 0, 29), "week");
      const days = divide(adapter, lastWeekOfJan, "day");

      const januaryDays = days.filter((d) => d.start.getMonth() === 0);
      const februaryDays = days.filter((d) => d.start.getMonth() === 1);

      expect(januaryDays.length + februaryDays.length).toBe(7);
      expect(januaryDays.length).toBeGreaterThan(0);
      expect(februaryDays.length).toBeGreaterThan(0);
    });

    it("should handle year boundaries when dividing", () => {
      // Create a week that spans year boundary
      const lastWeekOf2023 = period(adapter, new Date(2023, 11, 30), "week");
      const days = divide(adapter, lastWeekOf2023, "day");

      const days2023 = days.filter((d) => d.start.getFullYear() === 2023);
      const days2024 = days.filter((d) => d.start.getFullYear() === 2024);

      expect(days2023.length + days2024.length).toBe(7);
    });

    it("should handle daylight saving time transitions", () => {
      // Test spring forward (in US, typically March)
      const marchDay = period(adapter, new Date(2024, 2, 10), "day");
      const hours = divide(adapter, marchDay, "hour");

      // DST spring-forward days have 23 hours in affected timezones, 24 otherwise
      expect(hours.length).toBeGreaterThanOrEqual(23);
      expect(hours.length).toBeLessThanOrEqual(24);

      // Hours should be continuous regardless of DST
      for (let i = 1; i < hours.length; i++) {
        expect(hours[i].start.getTime()).toBeGreaterThan(
          hours[i - 1].start.getTime()
        );
      }
    });

    it("should handle partial periods correctly", () => {
      // Create a custom period that doesn't align with standard boundaries
      const customPeriod = {
        start: new Date(2024, 0, 15, 14, 30),
        end: new Date(2024, 0, 16, 10, 45),
        type: "custom" as const,
      };

      const hours = divide(adapter, customPeriod, "hour");

      // Should include partial hours at boundaries
      expect(hours.length).toBeGreaterThan(0);
      expect(hours[0].start.getTime()).toBeGreaterThanOrEqual(
        customPeriod.start.getTime()
      );
      expect(hours[hours.length - 1].end.getTime()).toBeLessThanOrEqual(
        customPeriod.end.getTime()
      );
    });
  });
});
