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

  // null/undefined is prevented by the type system — isSame requires Period.
});
