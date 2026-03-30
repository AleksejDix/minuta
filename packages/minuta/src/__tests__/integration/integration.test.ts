import { describe, it, expect } from "vitest";
import { derivePeriod as period, divide } from "../..";
import { createNativeAdapter } from "../../adapters/native";
import { createStableMonth, createStableYear } from "../../calendar";

describe("Calendar Units Integration", () => {
  describe("StableMonth Integration", () => {
    it("should create stableMonth with 42 day periods", () => {
      const adapter = createNativeAdapter();
      const grid = createStableMonth(adapter, 1, new Date(2024, 0, 1));

      expect(grid).toBeDefined();
      expect(grid.periods).toHaveLength(42);
      expect(grid.periods[0].type).toBe("day");
      expect(grid.monthStart).toBeInstanceOf(Date);
    });
  });

  describe("StableYear Integration", () => {
    const adapter = createNativeAdapter();
    const weekStartsOn = 1;

    it("should create stableYear with week periods", () => {
      const grid = createStableYear(
        adapter,
        weekStartsOn,
        new Date(2024, 5, 15)
      );

      expect(grid).toBeDefined();
      expect(grid.periods.length).toBeGreaterThanOrEqual(52);
      expect(grid.yearStart).toBeInstanceOf(Date);
    });

    it("should create GitHub-style contribution grid", () => {
      const grid = createStableYear(
        adapter,
        weekStartsOn,
        new Date(2024, 5, 15)
      );

      // Flatten weeks into days
      const days = grid.periods.flatMap((week) => divide(adapter, week, "day"));

      // Should have 52 or 53 weeks worth of days
      expect([364, 371]).toContain(days.length);

      // First day should be Monday
      expect(days[0].start.getDay()).toBe(1);

      // Last day should be Sunday
      expect(days[days.length - 1].start.getDay()).toBe(0);
    });

    it("should handle year transitions correctly", () => {
      const years = [2022, 2023, 2024, 2025];

      years.forEach((year) => {
        const grid = createStableYear(
          adapter,
          weekStartsOn,
          new Date(year, 0, 1)
        );

        expect([52, 53]).toContain(grid.periods.length);

        grid.periods.forEach((week) => {
          const days = divide(adapter, week, "day");
          expect(days).toHaveLength(7);
        });
      });
    });
  });

  describe("Combined Calendar Usage", () => {
    it("should create consistent month grids for a full year", () => {
      const adapter = createNativeAdapter();

      for (let month = 0; month < 12; month++) {
        const grid = createStableMonth(adapter, 1, new Date(2024, month, 15));
        expect(grid.periods).toHaveLength(42);
      }
    });

    it("should allow drilling from year to months", () => {
      const adapter = createNativeAdapter();

      const regularYear = period(adapter, new Date(2024, 5, 15), "year");
      const months = divide(adapter, regularYear, "month");

      months.forEach((month) => {
        const grid = createStableMonth(adapter, 1, month.start);
        expect(grid.periods).toHaveLength(42);
      });
    });
  });

  describe("Different weekStartsOn configurations", () => {
    it("should adapt stableYear to Sunday start", () => {
      const adapter = createNativeAdapter();
      const grid = createStableYear(adapter, 0, new Date(2024, 0, 1));
      const days = grid.periods.flatMap((week) => divide(adapter, week, "day"));

      expect(days[0].start.getDay()).toBe(0);
      expect(days[days.length - 1].start.getDay()).toBe(6);
    });

    it("should adapt stableMonth to Wednesday start", () => {
      const adapter = createNativeAdapter();
      const grid = createStableMonth(adapter, 3, new Date(2024, 5, 15));

      expect(grid.periods[0].start.getDay()).toBe(3);
      expect(grid.periods).toHaveLength(42);
    });
  });
});
