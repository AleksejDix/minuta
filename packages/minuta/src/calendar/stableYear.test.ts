import { describe, it, expect } from "vitest";
import { divide } from "../index";
import { createNativeAdapter } from "../adapters/native";
import { createDateFnsAdapter } from "../adapters/date-fns";
import { createLuxonAdapter } from "../adapters/luxon";
import { createStableYear } from "./stableYear";

describe("stableYear unit", () => {
  const adapters = [
    { name: "native", create: createNativeAdapter },
    { name: "date-fns", create: createDateFnsAdapter },
    { name: "luxon", create: createLuxonAdapter },
  ];

  adapters.forEach(({ name, create }) => {
    describe(`with ${name} adapter`, () => {
      const adapter = create();
      const weekStartsOn = 1; // Monday

      describe("basic functionality", () => {
        it("should create a stableYear period", () => {
          const date = new Date(2024, 5, 15); // June 15, 2024
          const stableYear = createStableYear(adapter, weekStartsOn, date);

          expect(stableYear).toBeDefined();
          expect(stableYear.periods).toBeDefined();
          expect(stableYear.periods[0].start).toBeInstanceOf(Date);
          expect(
            stableYear.periods[stableYear.periods.length - 1].end
          ).toBeInstanceOf(Date);
        });

        it("should have 52 or 53 weeks", () => {
          const date = new Date(2024, 0, 1); // Jan 1, 2024
          const stableYear = createStableYear(adapter, weekStartsOn, date);
          const weeks = stableYear.periods;

          expect([52, 53]).toContain(weeks.length);
        });

        it("should start on the configured weekStartsOn day", () => {
          const date = new Date(2024, 0, 1);
          const stableYear = createStableYear(adapter, weekStartsOn, date);

          // Monday = 1
          expect(stableYear.periods[0].start.getDay()).toBe(1);
        });

        it("should end on the day before weekStartsOn", () => {
          const date = new Date(2024, 0, 1);
          const stableYear = createStableYear(adapter, weekStartsOn, date);

          // Should end on Sunday (0) if week starts on Monday (1)
          expect(
            stableYear.periods[stableYear.periods.length - 1].end.getDay()
          ).toBe(0);
        });
      });

      describe("different year boundaries", () => {
        it("should handle 2024 (leap year, starts on Monday)", () => {
          const date = new Date(2024, 0, 1);
          const stableYear = createStableYear(adapter, weekStartsOn, date);
          const weeks = stableYear.periods;

          // 2024 starts on Monday, ends on Tuesday
          // Grid: Dec 25, 2023 (Mon) to Dec 29, 2024 (Sun) = 53 weeks
          expect(weeks.length).toBe(53);
          expect(stableYear.periods[0].start).toEqual(new Date(2024, 0, 1)); // Jan 1 is Monday
          expect(
            stableYear.periods[stableYear.periods.length - 1].end.getDate()
          ).toBe(5); // Jan 5, 2025 (Sunday)
          expect(
            stableYear.periods[stableYear.periods.length - 1].end.getFullYear()
          ).toBe(2025);
        });

        it("should handle 2023 (non-leap year, starts on Sunday)", () => {
          const date = new Date(2023, 0, 1);
          const stableYear = createStableYear(adapter, weekStartsOn, date);
          const weeks = stableYear.periods;

          // 2023 starts on Sunday, ends on Sunday
          // Grid needs to include Dec 26, 2022 (Mon) to Jan 1, 2024 (Mon) for full weeks
          expect(weeks.length).toBe(53);
          expect(stableYear.periods[0].start.getFullYear()).toBe(2022);
          expect(stableYear.periods[0].start.getMonth()).toBe(11); // December
          expect(stableYear.periods[0].start.getDate()).toBe(26); // Dec 26, 2022 (Monday)
        });

        it("should handle 2025 (starts on Wednesday)", () => {
          const date = new Date(2025, 0, 1);
          const stableYear = createStableYear(adapter, weekStartsOn, date);
          const weeks = stableYear.periods;

          // 2025 starts on Wednesday, ends on Wednesday
          // Grid: Dec 30, 2024 (Mon) to Jan 4, 2026 (Sun)
          expect(weeks.length).toBe(53);
          expect(stableYear.periods[0].start.getFullYear()).toBe(2024);
          expect(stableYear.periods[0].start.getMonth()).toBe(11); // December
          expect(stableYear.periods[0].start.getDate()).toBe(30); // Dec 30, 2024 (Monday)
        });
      });

      describe("different weekStartsOn values", () => {
        it("should handle weekStartsOn = 0 (Sunday)", () => {
          const date = new Date(2024, 0, 1);
          const stableYear = createStableYear(adapter, 0, date);

          expect(stableYear.periods[0].start.getDay()).toBe(0); // Sunday
          expect(
            stableYear.periods[stableYear.periods.length - 1].end.getDay()
          ).toBe(6); // Saturday
        });

        it("should handle weekStartsOn = 6 (Saturday)", () => {
          const date = new Date(2024, 0, 1);
          const stableYear = createStableYear(adapter, 6, date);

          expect(stableYear.periods[0].start.getDay()).toBe(6); // Saturday
          expect(
            stableYear.periods[stableYear.periods.length - 1].end.getDay()
          ).toBe(5); // Friday
        });
      });

      describe("divide operations", () => {
        it("should divide into weeks", () => {
          const date = new Date(2024, 5, 15);
          const stableYear = createStableYear(adapter, weekStartsOn, date);
          const weeks = stableYear.periods;

          expect(weeks.length).toBeGreaterThanOrEqual(52);
          expect(weeks.length).toBeLessThanOrEqual(53);

          // Each week should be a proper week period
          weeks.forEach((week) => {
            expect(week.type).toBe("week");
            const days = divide(adapter, week, "day");
            expect(days.length).toBe(7);
          });
        });

        it("should divide into days", () => {
          const date = new Date(2024, 0, 1);
          const stableYear = createStableYear(adapter, weekStartsOn, date);
          const days = divide(
            adapter,
            {
              start: stableYear.periods[0].start,
              end: stableYear.periods[stableYear.periods.length - 1].end,
              type: "custom" as const,
            },
            "day"
          );

          // Should have 52 * 7 = 364 or 53 * 7 = 371 days
          expect([364, 371]).toContain(days.length);

          // All days should be consecutive
          for (let i = 1; i < days.length; i++) {
            const prevDay = days[i - 1].end;
            const currentDay = days[i].start;
            // Days should be consecutive (start of current should be after end of previous)
            const expectedStart = new Date(prevDay.getTime() + 1);
            expect(currentDay.getTime()).toBe(expectedStart.getTime());
          }
        });
      });

      describe("validation", () => {
        it("should validate correct stableYear periods", () => {
          const date = new Date(2024, 0, 1);
          const stableYear = createStableYear(adapter, weekStartsOn, date);

          // Period should pass validation
          expect(stableYear.periods).toBeDefined();

          // Manual validation check
          const ms =
            stableYear.periods[stableYear.periods.length - 1].end.getTime() -
            stableYear.periods[0].start.getTime();
          const days = Math.round(ms / (1000 * 60 * 60 * 24)) + 1; // +1 for inclusive end
          const weeks = Math.round(days / 7);
          expect([52, 53]).toContain(weeks);
        });
      });

      describe("helper function", () => {
        it("should create stableYear with createStableYear helper", () => {
          const date = new Date(2024, 5, 15);
          const stableYear = createStableYear(adapter, weekStartsOn, date);

          expect(stableYear.periods).toBeDefined();
          expect(stableYear.periods[0].start.getDay()).toBe(1); // Monday (weekStartsOn)

          const weeks = stableYear.periods;
          expect([52, 53]).toContain(weeks.length);
        });

        it("should respect adapter's weekStartsOn in helper", () => {
          const date = new Date(2024, 0, 1);
          const stableYear = createStableYear(adapter, 2, date);

          expect(stableYear.periods[0].start.getDay()).toBe(2); // Tuesday
        });
      });

      describe("edge cases", () => {
        it("should handle year with 53 weeks", () => {
          // 2020 is a leap year that starts on Wednesday
          // This typically results in 53 weeks when week starts on Monday
          const date = new Date(2020, 0, 1);
          const stableYear = createStableYear(adapter, weekStartsOn, date);
          const weeks = stableYear.periods;

          expect(weeks.length).toBe(53);
        });

        it("should include partial weeks at year boundaries", () => {
          const date = new Date(2024, 0, 1);
          const stableYear = createStableYear(adapter, weekStartsOn, date);

          // First week should include days from previous year if needed
          const firstWeek = stableYear.periods[0];
          const firstWeekDays = divide(adapter, firstWeek, "day");

          // Should have 7 days
          expect(firstWeekDays.length).toBe(7);

          // Last week should include days from next year if needed
          const weeks = stableYear.periods;
          const lastWeek = weeks[weeks.length - 1];
          const lastWeekDays = divide(adapter, lastWeek, "day");

          expect(lastWeekDays.length).toBe(7);
        });
      });

      describe("GitHub-style contribution grid scenario", () => {
        it("should create a proper year grid for contributions", () => {
          const date = new Date(2024, 0, 1);
          const stableYear = createStableYear(adapter, weekStartsOn, date);
          const days = divide(
            adapter,
            {
              start: stableYear.periods[0].start,
              end: stableYear.periods[stableYear.periods.length - 1].end,
              type: "custom" as const,
            },
            "day"
          );

          // Should have exactly 52 or 53 weeks worth of days
          expect([364, 371]).toContain(days.length);

          // Group days into weeks (7 days each)
          const weeks = [];
          for (let i = 0; i < days.length; i += 7) {
            weeks.push(days.slice(i, i + 7));
          }

          expect([52, 53]).toContain(weeks.length);

          // Each week should have exactly 7 days
          weeks.forEach((week) => {
            expect(week.length).toBe(7);
          });

          // First day should be the configured weekStartsOn
          expect(days[0].start.getDay()).toBe(1); // Monday
        });

        it("should maintain consistent grid alignment across years", () => {
          const years = [2022, 2023, 2024, 2025];

          years.forEach((year) => {
            const date = new Date(year, 0, 1);
            const stableYear = createStableYear(adapter, weekStartsOn, date);
            const days = divide(
              adapter,
              {
                start: stableYear.periods[0].start,
                end: stableYear.periods[stableYear.periods.length - 1].end,
                type: "custom" as const,
              },
              "day"
            );

            // First day should always be Monday (weekStartsOn = 1)
            expect(days[0].start.getDay()).toBe(1);

            // Last day should always be Sunday
            const lastDay = days[days.length - 1];
            expect(lastDay.end.getDate() - lastDay.start.getDate()).toBe(0); // Same day
            expect(lastDay.start.getDay()).toBe(0); // Sunday

            // Total days should be divisible by 7
            expect(days.length % 7).toBe(0);
          });
        });
      });
    });
  });
});
