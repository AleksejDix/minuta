import { describe, it, expect } from "vitest";
import { isSame } from "./isSame";
import { derivePeriod as period } from "./period";
import type { Period } from "../types";
import {
  withAllAdapters,
  getAdapterTestCases,
} from "../test/shared-adapter-tests";
import { testDates } from "../test/testDates";

// Example using withAllAdapters wrapper
withAllAdapters("isSame operation", (adapter) => {
  describe("year comparison", () => {
    it("should return true for same year", () => {
      const period1 = period(adapter, testDates.jan1, "year");
      const period2 = period(adapter, testDates.dec31, "year");

      expect(isSame(adapter, period1, period2, "year")).toBe(true);
    });

    it("should return false for different years", () => {
      const period1 = period(adapter, testDates.dec31, "year");
      const period2 = period(adapter, testDates.year2025, "year");

      expect(isSame(adapter, period1, period2, "year")).toBe(false);
    });
  });

  describe("custom period comparison", () => {
    it("should return true for custom periods with same boundaries", () => {
      const start = new Date(2024, 5, 15, 14, 30, 45, 123);
      const end = new Date(start.getTime() + 1000 * 60 * 60 * 24);
      const period1: Period = { start, end, type: "custom" };
      const period2: Period = { start, end, type: "custom" };

      expect(isSame(adapter, period1, period2, "custom")).toBe(true);
    });
  });
});

// Alternative: Using describe.each for more granular control
const adapters = getAdapterTestCases();

describe.each(adapters)("isSame with %s adapter", (_, adapter) => {
  it("should handle month comparison correctly", () => {
    const period1 = period(adapter, testDates.jun1, "month");
    const period2 = period(adapter, testDates.jun30, "month");

    expect(isSame(adapter, period1, period2, "month")).toBe(true);
  });

  describe("cross-unit comparison", () => {
    it("days in the same week → true", () => {
      // Jan 10 2024 = Wednesday, Jan 12 2024 = Friday → same week
      const day1 = period(adapter, new Date(2024, 0, 10), "day");
      const day2 = period(adapter, new Date(2024, 0, 12), "day");
      expect(isSame(adapter, day1, day2, "week")).toBe(true);
    });

    it("days in different weeks → false", () => {
      // Jan 10 2024 (Wed) vs Jan 15 2024 (Mon next week)
      const day1 = period(adapter, new Date(2024, 0, 10), "day");
      const day2 = period(adapter, testDates.jan15, "day");
      expect(isSame(adapter, day1, day2, "week")).toBe(false);
    });

    it("hours in the same day → true", () => {
      const hour1 = period(adapter, new Date(2024, 5, 15, 9), "hour");
      const hour2 = period(adapter, new Date(2024, 5, 15, 17), "hour");
      expect(isSame(adapter, hour1, hour2, "day")).toBe(true);
    });

    it("hours in different days → false", () => {
      const hour1 = period(adapter, new Date(2024, 5, 15, 23), "hour");
      const hour2 = period(adapter, new Date(2024, 5, 16, 0), "hour");
      expect(isSame(adapter, hour1, hour2, "day")).toBe(false);
    });

    it("month and week in the same quarter → true", () => {
      // June (Q2) and a week in May (Q2)
      const monthPeriod = period(adapter, testDates.jun1, "month");
      const weekPeriod = period(adapter, testDates.may15, "week");
      expect(isSame(adapter, monthPeriod, weekPeriod, "quarter")).toBe(true);
    });

    it("month and week in different quarters → false", () => {
      // June (Q2) and a week in November (Q4)
      const monthPeriod = period(adapter, testDates.jun1, "month");
      const weekPeriod = period(adapter, testDates.nov15, "week");
      expect(isSame(adapter, monthPeriod, weekPeriod, "quarter")).toBe(false);
    });

    it("days in the same month → true", () => {
      const day1 = period(adapter, testDates.jun1, "day");
      const day2 = period(adapter, testDates.jun30, "day");
      expect(isSame(adapter, day1, day2, "month")).toBe(true);
    });

    it("days in different months → false", () => {
      const day1 = period(adapter, testDates.jun30, "day");
      const day2 = period(adapter, new Date(2024, 6, 1), "day");
      expect(isSame(adapter, day1, day2, "month")).toBe(false);
    });
  });

  describe("custom period comparison", () => {
    it("same start and end → true", () => {
      const start = new Date(2024, 5, 15);
      const end = new Date(2024, 5, 20);
      const p1: Period = { start, end, type: "custom" };
      const p2: Period = { start, end, type: "custom" };
      expect(isSame(adapter, p1, p2, "custom")).toBe(true);
    });

    it("same start, different end → false", () => {
      const start = new Date(2024, 5, 15);
      const p1: Period = { start, end: new Date(2024, 5, 20), type: "custom" };
      const p2: Period = { start, end: new Date(2024, 5, 25), type: "custom" };
      expect(isSame(adapter, p1, p2, "custom")).toBe(false);
    });

    it("different start, same end → false", () => {
      const end = new Date(2024, 5, 20);
      const p1: Period = {
        start: new Date(2024, 5, 15),
        end,
        type: "custom",
      };
      const p2: Period = {
        start: new Date(2024, 5, 16),
        end,
        type: "custom",
      };
      expect(isSame(adapter, p1, p2, "custom")).toBe(false);
    });
  });
});
