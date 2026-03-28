import { describe, it, expect } from "vitest";
import { contains } from "./contains";
import { testDates } from "../test/testDates";
import type { Period } from "../types";

describe("contains", () => {
  describe("Period contains Date", () => {
    it("should check if year contains dates", () => {
      const year: Period = {
        start: new Date(2024, 0, 1, 0, 0, 0, 0),
        end: new Date(2024, 11, 31, 23, 59, 59, 999),
        type: "year",
      };

      expect(contains(year, new Date(2024, 0, 1))).toBe(true); // First day
      expect(contains(year, new Date(2024, 11, 31))).toBe(true); // Last day
      expect(contains(year, new Date(2024, 6, 15))).toBe(true); // Mid-year
      expect(contains(year, new Date(2023, 11, 31))).toBe(false); // Previous year
      expect(contains(year, new Date(2025, 0, 1))).toBe(false); // Next year
    });

    it("should check if month contains dates", () => {
      const february: Period = {
        start: new Date(2024, 1, 1, 0, 0, 0, 0),
        end: new Date(2024, 1, 29, 23, 59, 59, 999), // Leap year
        type: "month",
      };

      expect(contains(february, new Date(2024, 1, 1))).toBe(true); // First day
      expect(contains(february, new Date(2024, 1, 29))).toBe(true); // Last day (leap year)
      expect(contains(february, new Date(2024, 1, 15))).toBe(true); // Mid-month
      expect(contains(february, new Date(2024, 0, 31))).toBe(false); // Previous month
      expect(contains(february, new Date(2024, 2, 1))).toBe(false); // Next month
    });

    it("should check if week contains dates", () => {
      const week: Period = {
        start: new Date(2024, 0, 8, 0, 0, 0, 0), // Monday
        end: new Date(2024, 0, 14, 23, 59, 59, 999), // Sunday
        type: "week",
      };

      expect(contains(week, new Date(2024, 0, 8))).toBe(true); // Monday
      expect(contains(week, new Date(2024, 0, 14))).toBe(true); // Sunday
      expect(contains(week, new Date(2024, 0, 10))).toBe(true); // Wednesday
      expect(contains(week, new Date(2024, 0, 7))).toBe(false); // Previous Sunday
      expect(contains(week, new Date(2024, 0, 15))).toBe(false); // Next Monday
    });

    it("should check if day contains times", () => {
      const day: Period = {
        start: new Date(2024, 0, 15, 0, 0, 0, 0),
        end: new Date(2024, 0, 15, 23, 59, 59, 999),
        type: "day",
      };

      expect(contains(day, new Date(2024, 0, 15, 0, 0, 0))).toBe(true); // Start
      expect(contains(day, new Date(2024, 0, 15, 23, 59, 59))).toBe(true); // End
      expect(contains(day, new Date(2024, 0, 15, 12, 30))).toBe(true); // Noon
      expect(contains(day, new Date(2024, 0, 16, 0, 0, 0))).toBe(false); // Next day
    });

    it("should check if hour contains minutes", () => {
      const hour: Period = {
        start: new Date(2024, 0, 15, 14, 0, 0, 0),
        end: new Date(2024, 0, 15, 14, 59, 59, 999),
        type: "hour",
      };

      expect(contains(hour, new Date(2024, 0, 15, 14, 0))).toBe(true); // Start
      expect(contains(hour, new Date(2024, 0, 15, 14, 59, 59))).toBe(true); // End
      expect(contains(hour, new Date(2024, 0, 15, 14, 30))).toBe(true); // Middle
      expect(contains(hour, new Date(2024, 0, 15, 15, 0))).toBe(false); // Next hour
      expect(contains(hour, new Date(2024, 0, 15, 13, 59, 59))).toBe(false); // Previous hour
    });
  });

  describe("Period contains Period", () => {
    it("should check if year contains month", () => {
      const year: Period = {
        start: new Date(2024, 0, 1),
        end: new Date(2024, 11, 31, 23, 59, 59, 999),
        type: "year",
      };

      const june2024: Period = {
        start: new Date(2024, 5, 1),
        end: new Date(2024, 5, 30, 23, 59, 59, 999),
        type: "month",
      };

      const jan2025: Period = {
        start: new Date(2025, 0, 1),
        end: new Date(2025, 0, 31, 23, 59, 59, 999),
        type: "month",
      };

      expect(contains(year, june2024)).toBe(true);
      expect(contains(year, jan2025)).toBe(false);
    });

    it("should check if month contains day", () => {
      const month: Period = {
        start: new Date(2024, 1, 1),
        end: new Date(2024, 1, 29, 23, 59, 59, 999),
        type: "month",
      };

      const dayInMonth: Period = {
        start: new Date(2024, 1, 15, 0, 0, 0),
        end: new Date(2024, 1, 15, 23, 59, 59, 999),
        type: "day",
      };

      const dayOutsideMonth: Period = {
        start: new Date(2024, 2, 1, 0, 0, 0),
        end: new Date(2024, 2, 1, 23, 59, 59, 999),
        type: "day",
      };

      expect(contains(month, dayInMonth)).toBe(true);
      expect(contains(month, dayOutsideMonth)).toBe(false);
    });

    it("should check if week contains day", () => {
      const week: Period = {
        start: new Date(2024, 0, 8),
        end: new Date(2024, 0, 14, 23, 59, 59, 999),
        type: "week",
      };

      const monday: Period = {
        start: new Date(2024, 0, 8, 0, 0, 0),
        end: new Date(2024, 0, 8, 23, 59, 59, 999),
        type: "day",
      };

      const nextMonday: Period = {
        start: new Date(2024, 0, 15, 0, 0, 0),
        end: new Date(2024, 0, 15, 23, 59, 59, 999),
        type: "day",
      };

      expect(contains(week, monday)).toBe(true);
      expect(contains(week, nextMonday)).toBe(false);
    });

    it("should check if day contains hour", () => {
      const day: Period = {
        start: new Date(2024, 0, 15, 0, 0, 0),
        end: new Date(2024, 0, 15, 23, 59, 59, 999),
        type: "day",
      };

      const morningHour: Period = {
        start: new Date(2024, 0, 15, 8, 0, 0),
        end: new Date(2024, 0, 15, 8, 59, 59, 999),
        type: "hour",
      };

      const nextDayHour: Period = {
        start: new Date(2024, 0, 16, 0, 0, 0),
        end: new Date(2024, 0, 16, 0, 59, 59, 999),
        type: "hour",
      };

      expect(contains(day, morningHour)).toBe(true);
      expect(contains(day, nextDayHour)).toBe(false);
    });
  });

  describe("Edge cases", () => {
    it("should handle boundary times correctly", () => {
      const day: Period = {
        start: new Date(2024, 0, 15, 0, 0, 0, 0),
        end: new Date(2024, 0, 15, 23, 59, 59, 999),
        type: "day",
      };

      const startOfDay = new Date(2024, 0, 15, 0, 0, 0, 0);
      const endOfDay = new Date(2024, 0, 15, 23, 59, 59, 999);

      expect(contains(day, startOfDay)).toBe(true);
      expect(contains(day, endOfDay)).toBe(true);
    });

    it("should handle cross-month boundaries", () => {
      const january: Period = {
        start: new Date(2024, 0, 1, 0, 0, 0),
        end: new Date(2024, 0, 31, 23, 59, 59, 999),
        type: "month",
      };

      const lastDayJan = new Date(2024, 0, 31, 23, 59, 59);
      const firstDayFeb = new Date(2024, 1, 1, 0, 0, 0);

      expect(contains(january, lastDayJan)).toBe(true);
      expect(contains(january, firstDayFeb)).toBe(false);
    });
  });
});
