import { describe, it, expect } from "vitest";
import { derivePeriod as period } from "./period";
import { withAllAdapters } from "../test/shared-adapter-tests";

withAllAdapters("period", (adapter) => {
  describe("period creation", () => {
    it("should create year periods correctly", () => {
      const date = new Date(2024, 5, 15, 14, 30, 45);
      const year = period(adapter, date, "year");

      expect(year.type).toBe("year");
      expect(year.start.getFullYear()).toBe(2024);
      expect(year.start.getMonth()).toBe(0);
      expect(year.start.getDate()).toBe(1);
      expect(year.start.getHours()).toBe(0);
      expect(year.start.getMinutes()).toBe(0);
      expect(year.start.getSeconds()).toBe(0);

      expect(year.end.getFullYear()).toBe(2024);
      expect(year.end.getMonth()).toBe(11);
      expect(year.end.getDate()).toBe(31);
      expect(year.end.getHours()).toBe(23);
      expect(year.end.getMinutes()).toBe(59);
      expect(year.end.getSeconds()).toBe(59);
    });

    it("should create month periods correctly", () => {
      const date = new Date(2024, 1, 15); // February
      const month = period(adapter, date, "month");

      expect(month.type).toBe("month");
      expect(month.start.getMonth()).toBe(1);
      expect(month.start.getDate()).toBe(1);
      expect(month.end.getMonth()).toBe(1);
      expect(month.end.getDate()).toBe(29); // 2024 is a leap year
    });

    it("should create week periods correctly", () => {
      const date = new Date(2024, 0, 10); // Wednesday
      const week = period(adapter, date, "week");

      expect(week.type).toBe("week");
      // Week should start on Monday (weekStartsOn: 1)
      expect(week.start.getDay()).toBe(1);
      expect(week.end.getDay()).toBe(0); // Sunday

      // Check that the week contains the original date
      expect(week.start.getTime()).toBeLessThanOrEqual(date.getTime());
      expect(week.end.getTime()).toBeGreaterThanOrEqual(date.getTime());
    });

    it("should create day periods correctly", () => {
      const date = new Date(2024, 0, 15, 14, 30, 45);
      const day = period(adapter, date, "day");

      expect(day.type).toBe("day");
      expect(day.start.getDate()).toBe(15);
      expect(day.start.getHours()).toBe(0);
      expect(day.start.getMinutes()).toBe(0);
      expect(day.start.getSeconds()).toBe(0);

      expect(day.end.getDate()).toBe(15);
      expect(day.end.getHours()).toBe(23);
      expect(day.end.getMinutes()).toBe(59);
      expect(day.end.getSeconds()).toBe(59);
    });

    it("should create hour periods correctly", () => {
      const date = new Date(2024, 0, 15, 14, 30, 45);
      const hour = period(adapter, date, "hour");

      expect(hour.type).toBe("hour");
      expect(hour.start.getHours()).toBe(14);
      expect(hour.start.getMinutes()).toBe(0);
      expect(hour.start.getSeconds()).toBe(0);

      expect(hour.end.getHours()).toBe(14);
      expect(hour.end.getMinutes()).toBe(59);
      expect(hour.end.getSeconds()).toBe(59);
    });

    it("should create minute periods correctly", () => {
      const date = new Date(2024, 0, 15, 14, 30, 45);
      const minute = period(adapter, date, "minute");

      expect(minute.type).toBe("minute");
      expect(minute.start.getMinutes()).toBe(30);
      expect(minute.start.getSeconds()).toBe(0);

      expect(minute.end.getMinutes()).toBe(30);
      expect(minute.end.getSeconds()).toBe(59);
    });

    it("should create second periods correctly", () => {
      const date = new Date(2024, 0, 15, 14, 30, 45, 500);
      const second = period(adapter, date, "second");

      expect(second.type).toBe("second");
      expect(second.start.getSeconds()).toBe(45);
      expect(second.start.getMilliseconds()).toBe(0);

      expect(second.end.getSeconds()).toBe(45);
      expect(second.end.getMilliseconds()).toBe(999);
    });

    it("should handle month boundaries correctly", () => {
      // Test February in non-leap year
      const feb2023 = period(adapter, new Date(2023, 1, 15), "month");
      expect(feb2023.end.getDate()).toBe(28);

      // Test months with 30 days
      const april = period(adapter, new Date(2024, 3, 15), "month");
      expect(april.end.getDate()).toBe(30);

      // Test months with 31 days
      const january = period(adapter, new Date(2024, 0, 15), "month");
      expect(january.end.getDate()).toBe(31);
    });

    it("should handle year boundaries correctly", () => {
      const newYearsEve = new Date(2023, 11, 31, 23, 59, 59);
      const day = period(adapter, newYearsEve, "day");

      expect(day.start.getFullYear()).toBe(2023);
      expect(day.end.getFullYear()).toBe(2023);

      const week = period(adapter, newYearsEve, "week");
      // Week might span across years
      expect(week.start.getTime()).toBeLessThanOrEqual(newYearsEve.getTime());
      expect(week.end.getTime()).toBeGreaterThanOrEqual(newYearsEve.getTime());
    });

    it("should have start normalized to unit boundary", () => {
      const date = new Date(2024, 5, 15, 14, 30);
      const p = period(adapter, date, "month");
      // start should be June 1, not June 15
      expect(p.start.getDate()).toBe(1);
      expect(p.start.getMonth()).toBe(5);
    });
  });
});
