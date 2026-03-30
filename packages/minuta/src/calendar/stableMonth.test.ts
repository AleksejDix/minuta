import { describe, it, expect } from "vitest";
import { derivePeriod as period, divide, contains } from "..";
import { createNativeAdapter } from "../adapters/native";
import { createDateFnsAdapter } from "../adapters/date-fns";
import { createLuxonAdapter } from "../adapters/luxon";
import { createStableMonth } from "./stableMonth";

describe("StableMonth Unit", () => {
  const adapters = [
    { name: "native", create: createNativeAdapter },
    { name: "date-fns", create: createDateFnsAdapter },
    { name: "luxon", create: createLuxonAdapter },
  ];

  adapters.forEach(({ name, create }) => {
    describe(`with ${name} adapter`, () => {
      it("should create stableMonth period spanning 42 days", () => {
        const date = new Date(2024, 0, 15); // Jan 15, 2024
        const adapter = create();
        const weekStartsOn = 1;

        const stableMonthPeriod = createStableMonth(
          adapter,
          weekStartsOn,
          date
        );

        // Calculate days between start and end
        const days = Math.round(
          (stableMonthPeriod.periods[
            stableMonthPeriod.periods.length - 1
          ].end.getTime() -
            stableMonthPeriod.periods[0].start.getTime()) /
            (1000 * 60 * 60 * 24)
        );

        expect(stableMonthPeriod.periods.length).toBe(42);
        expect(days).toBe(42); // 42 days total
      });

      describe("divide operation", () => {
        it("should always return exactly 42 days when dividing by day", () => {
          const date = new Date(2024, 1, 1); // Feb 1, 2024
          const adapter = create();
          const weekStartsOn = 1;

          const stableMonth = createStableMonth(adapter, weekStartsOn, date);
          const days = stableMonth.periods;

          expect(days).toHaveLength(42);
          expect(days[0].type).toBe("day");
          expect(days[41].type).toBe("day");
        });

        it("should always return exactly 6 weeks when dividing by week", () => {
          const date = new Date(2024, 1, 1); // Feb 1, 2024
          const adapter = create();
          const weekStartsOn = 1;

          const stableMonth = createStableMonth(adapter, weekStartsOn, date);
          const weeks = divide(
            adapter,
            {
              start: stableMonth.periods[0].start,
              end: stableMonth.periods[stableMonth.periods.length - 1].end,
              type: "custom" as const,
            },
            "week"
          );

          expect(weeks).toHaveLength(6);
          weeks.forEach((week) => {
            expect(week.type).toBe("week");
          });
        });

        it("should respect weekStartsOn setting", () => {
          const date = new Date(2024, 0, 1); // Jan 1, 2024 (Monday)
          const adapter = create();

          // Test with Sunday start
          const sundayMonth = createStableMonth(adapter, 0, date);
          expect(sundayMonth.periods[0].start.getDay()).toBe(0); // Should start on Sunday

          // Test with Monday start
          const mondayMonth = createStableMonth(adapter, 1, date);
          expect(mondayMonth.periods[0].start.getDay()).toBe(1); // Should start on Monday
        });

        it("should handle February correctly (shortest month)", () => {
          const date = new Date(2024, 1, 15); // Feb 15, 2024
          const adapter = create();
          const weekStartsOn = 1;

          const stableMonth = createStableMonth(adapter, weekStartsOn, date);
          const days = stableMonth.periods;

          expect(days).toHaveLength(42);

          // Check that we have days from January and March
          const months = new Set(days.map((d) => d.start.getMonth()));
          expect(months.size).toBeGreaterThan(1); // Should span multiple months
        });

        it("should handle year boundaries", () => {
          const date = new Date(2023, 11, 15); // Dec 15, 2023
          const adapter = create();
          const weekStartsOn = 1;

          const stableMonth = createStableMonth(adapter, weekStartsOn, date);
          const days = stableMonth.periods;

          expect(days).toHaveLength(42);

          // Check that we have days from different years
          const years = new Set(days.map((d) => d.start.getFullYear()));
          if (years.size > 1) {
            expect([...years]).toContain(2023);
            expect([...years]).toContain(2024);
          }
        });
      });

      describe("navigation operations", () => {
        it("should create stableMonth for different months", () => {
          const adapter = create();
          const weekStartsOn = 1;

          // Create stableMonth for different months manually
          const january = createStableMonth(
            adapter,
            weekStartsOn,
            new Date(2024, 0, 15)
          );
          const february = createStableMonth(
            adapter,
            weekStartsOn,
            new Date(2024, 1, 15)
          );

          expect(january.periods.length).toBe(42);
          expect(february.periods.length).toBe(42);

          // Both should be 42 days
          const janDays = Math.round(
            (january.periods[january.periods.length - 1].end.getTime() -
              january.periods[0].start.getTime()) /
              (1000 * 60 * 60 * 24)
          );
          const febDays = Math.round(
            (february.periods[february.periods.length - 1].end.getTime() -
              february.periods[0].start.getTime()) /
              (1000 * 60 * 60 * 24)
          );

          expect(janDays).toBe(42);
          expect(febDays).toBe(42);
        });
      });

      describe("comparison operations", () => {
        it("should check if date is contained in stableMonth", () => {
          const date = new Date(2024, 0, 15); // Jan 15, 2024
          const adapter = create();
          const weekStartsOn = 1;

          const stableMonth = createStableMonth(adapter, weekStartsOn, date);

          // Date in the middle of the month
          const midMonthPeriod = period(adapter, new Date(2024, 0, 20), "day");
          expect(
            contains(
              {
                start: stableMonth.periods[0].start,
                end: stableMonth.periods[stableMonth.periods.length - 1].end,
                type: "custom" as const,
              },
              midMonthPeriod
            )
          ).toBe(true);

          // Date from previous month that's included in the grid
          const earlyDate = new Date(stableMonth.periods[0].start);
          const earlyPeriod = period(adapter, earlyDate, "day");
          expect(
            contains(
              {
                start: stableMonth.periods[0].start,
                end: stableMonth.periods[stableMonth.periods.length - 1].end,
                type: "custom" as const,
              },
              earlyPeriod
            )
          ).toBe(true);
        });

        it("should check if two stableMonths have the same boundaries", () => {
          const date = new Date(2024, 0, 15); // Jan 15, 2024
          const adapter = create();
          const weekStartsOn = 1;

          const month1 = createStableMonth(adapter, weekStartsOn, date);
          const month2 = createStableMonth(adapter, weekStartsOn, date);

          // Same date should produce same boundaries
          expect(month1.periods[0].start.getTime()).toBe(
            month2.periods[0].start.getTime()
          );
          expect(month1.periods[month1.periods.length - 1].end.getTime()).toBe(
            month2.periods[month2.periods.length - 1].end.getTime()
          );

          // Different month should have different boundaries
          const february = createStableMonth(
            adapter,
            weekStartsOn,
            new Date(2024, 1, 15)
          );
          expect(month1.periods[0].start.getTime()).not.toBe(
            february.periods[0].start.getTime()
          );
        });
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle leap years correctly", () => {
      const date = new Date(2024, 1, 15); // Feb 15, 2024 (leap year)
      const adapter = createNativeAdapter();
      const weekStartsOn = 1;

      const stableMonth = createStableMonth(adapter, weekStartsOn, date);
      const days = stableMonth.periods;

      expect(days).toHaveLength(42);

      // February 2024 has 29 days
      const febDays = days.filter((d) => d.start.getMonth() === 1);
      expect(febDays.length).toBeLessThanOrEqual(29);
    });

    it("should handle different weekStartsOn values", () => {
      const weekStarts = [0, 1, 2, 3, 4, 5, 6]; // Sunday through Saturday
      const date = new Date(2024, 0, 1); // Jan 1, 2024
      const adapter = createNativeAdapter();

      weekStarts.forEach((weekStartsOn) => {
        const stableMonth = createStableMonth(adapter, weekStartsOn, date);
        expect(stableMonth.periods[0].start.getDay()).toBe(weekStartsOn);

        // Always 42 days
        const days = Math.round(
          (stableMonth.periods[stableMonth.periods.length - 1].end.getTime() -
            stableMonth.periods[0].start.getTime()) /
            (1000 * 60 * 60 * 24)
        );
        expect(days).toBe(42); // 42 days total
      });
    });
  });
});
