import type { Adapter, Period, ReadonlyPeriod } from "#src/types";
import { describe, expect, it } from "vitest";
import { createDateFnsAdapter } from "#src/adapters/date-fns/index";
import { createLuxonAdapter } from "#src/adapters/luxon/index";
import { createNativeAdapter } from "#src/adapters/native/index";
import { createStableYear } from "./stable-year";
import { divide } from "#src/index";

const SUNDAY = 0;
const MONDAY = 1;
const DAYS_PER_WEEK = 7;
const ONE_MS = 1;
const FIRST_INDEX = 0;
const NEXT_INDEX = 1;
const LAST_INDEX = -1;
const NO_REMAINDER = 0;
const SAME_DAY = 0;
const SHORT_YEAR_WEEKS = 52;
const LONG_YEAR_WEEKS = 53;
const SHORT_YEAR_DAYS = 364;
const LONG_YEAR_DAYS = 371;

const ADAPTERS = [
  ["native", createNativeAdapter()],
  ["date-fns", createDateFnsAdapter()],
  ["luxon", createLuxonAdapter()],
] as const;

const YEAR_STARTS = [
  "2022-01-01T00:00:00",
  "2023-01-01T00:00:00",
  "2024-01-01T00:00:00",
  "2025-01-01T00:00:00",
] as const;

function firstPeriod(periods: readonly ReadonlyPeriod[]): ReadonlyPeriod {
  const [first] = periods;
  if (first === undefined) {
    throw new Error("Expected at least one period");
  }
  return first;
}

function lastPeriod(periods: readonly ReadonlyPeriod[]): ReadonlyPeriod {
  const last = periods.at(LAST_INDEX);
  if (last === undefined) {
    throw new Error("Expected at least one period");
  }
  return last;
}

function gridDays(
  adapter: Readonly<Adapter>,
  periods: readonly ReadonlyPeriod[]
): Period[] {
  return divide(
    adapter,
    {
      end: lastPeriod(periods).end,
      start: firstPeriod(periods).start,
      type: "custom",
    },
    "day"
  );
}

function chunkIntoWeeks(days: readonly ReadonlyPeriod[]): ReadonlyPeriod[][] {
  const weeks: ReadonlyPeriod[][] = [];
  for (let index = 0; index < days.length; index += DAYS_PER_WEEK) {
    weeks.push(days.slice(index, index + DAYS_PER_WEEK));
  }
  return weeks;
}

describe.each(ADAPTERS)(
  "createStableYear() divide operations with %s adapter",
  (_name: string, adapter: Readonly<Adapter>) => {
    it("should divide into weeks", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const date = new Date("2024-06-15T00:00:00");
      const weeks = createStableYear(adapter, MONDAY, date).periods;

      expect(weeks.length).toBeGreaterThanOrEqual(SHORT_YEAR_WEEKS);
      expect(weeks.length).toBeLessThanOrEqual(LONG_YEAR_WEEKS);

      // Each week should be a proper week period
      for (const week of weeks) {
        expect(week.type).toBe("week");
        expect(divide(adapter, week, "day")).toHaveLength(DAYS_PER_WEEK);
      }
    });

    it("should divide into days", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const date = new Date("2024-01-01T00:00:00");
      const days = gridDays(
        adapter,
        createStableYear(adapter, MONDAY, date).periods
      );

      // Should have 52 * 7 = 364 or 53 * 7 = 371 days
      expect([SHORT_YEAR_DAYS, LONG_YEAR_DAYS]).toContain(days.length);

      // Each day should start 1ms after the end of the previous day
      const starts = days
        .slice(NEXT_INDEX)
        .map((day: ReadonlyPeriod) => day.start.getTime());
      const expectedStarts = days
        .slice(FIRST_INDEX, LAST_INDEX)
        .map((day: ReadonlyPeriod) => day.end.getTime() + ONE_MS);
      expect(starts).toStrictEqual(expectedStarts);
    });
  }
);

describe.each(ADAPTERS)(
  "createStableYear() edge cases with %s adapter",
  (_name: string, adapter: Readonly<Adapter>) => {
    it("should handle year with 53 weeks", { timeout: 5000 }, () => {
      expect.hasAssertions();
      /*
       * 2020 is a leap year that starts on Wednesday.
       * This typically results in 53 weeks when week starts on Monday.
       */
      const date = new Date("2020-01-01T00:00:00");
      const stableYear = createStableYear(adapter, MONDAY, date);

      expect(stableYear.periods).toHaveLength(LONG_YEAR_WEEKS);
    });

    it(
      "should include partial weeks at year boundaries",
      { timeout: 5000 },
      () => {
        expect.hasAssertions();
        const date = new Date("2024-01-01T00:00:00");
        const stableYear = createStableYear(adapter, MONDAY, date);

        // First week should include days from previous year if needed
        const firstWeek = firstPeriod(stableYear.periods);
        expect(divide(adapter, firstWeek, "day")).toHaveLength(DAYS_PER_WEEK);

        // Last week should include days from next year if needed
        const lastWeek = lastPeriod(stableYear.periods);
        expect(divide(adapter, lastWeek, "day")).toHaveLength(DAYS_PER_WEEK);
      }
    );
  }
);

describe.each(ADAPTERS)(
  "createStableYear() contribution grid with %s adapter",
  (_name: string, adapter: Readonly<Adapter>) => {
    it(
      "should create a proper year grid for contributions",
      { timeout: 5000 },
      () => {
        expect.hasAssertions();
        const date = new Date("2024-01-01T00:00:00");
        const days = gridDays(
          adapter,
          createStableYear(adapter, MONDAY, date).periods
        );

        // Should have exactly 52 or 53 weeks worth of days
        expect([SHORT_YEAR_DAYS, LONG_YEAR_DAYS]).toContain(days.length);

        // Group days into weeks (7 days each)
        const weeks = chunkIntoWeeks(days);

        expect([SHORT_YEAR_WEEKS, LONG_YEAR_WEEKS]).toContain(weeks.length);

        // Each week should have exactly 7 days
        for (const week of weeks) {
          expect(week).toHaveLength(DAYS_PER_WEEK);
        }

        // First day should be the configured weekStartsOn (Monday)
        expect(firstPeriod(days).start.getDay()).toBe(MONDAY);
      }
    );
  }
);

describe.each(ADAPTERS)(
  "createStableYear() grid alignment with %s adapter",
  (_name: string, adapter: Readonly<Adapter>) => {
    it(
      "should maintain consistent grid alignment across years",
      { timeout: 5000 },
      () => {
        expect.hasAssertions();

        for (const yearStart of YEAR_STARTS) {
          const date = new Date(yearStart);
          const days = gridDays(
            adapter,
            createStableYear(adapter, MONDAY, date).periods
          );

          // First day should always be Monday (weekStartsOn = 1)
          expect(firstPeriod(days).start.getDay()).toBe(MONDAY);

          // Last day should always be a single Sunday
          const lastDay = lastPeriod(days);
          expect(lastDay.end.getDate() - lastDay.start.getDate()).toBe(
            SAME_DAY
          );
          expect(lastDay.start.getDay()).toBe(SUNDAY);

          // Total days should be divisible by 7
          expect(days.length % DAYS_PER_WEEK).toBe(NO_REMAINDER);
        }
      }
    );
  }
);
