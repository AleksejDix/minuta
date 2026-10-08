import type { Period, Units } from "#src/types";
import { describe, expect, it } from "vitest";
import { dateFnsUnits } from "#src/adapters/date-fns/index";
import { divideWith } from "#src/operations/index";
import { luxonUnits } from "#src/adapters/luxon/index";
import { nativeUnits } from "#src/adapters/native/index";
import { yearGridWith } from "./year-grid";

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
  ["native", nativeUnits({ weekStartsOn: MONDAY })],
  ["date-fns", dateFnsUnits({ weekStartsOn: MONDAY })],
  ["luxon", luxonUnits({ weekStartsOn: MONDAY })],
] as const;

const YEAR_STARTS = [
  "2022-01-01T00:00:00",
  "2023-01-01T00:00:00",
  "2024-01-01T00:00:00",
  "2025-01-01T00:00:00",
] as const;

function firstPeriod(periods: readonly Period[]): Period {
  const [first] = periods;
  if (first === undefined) {
    throw new Error("Expected at least one period");
  }
  return first;
}

function lastPeriod(periods: readonly Period[]): Period {
  const last = periods.at(LAST_INDEX);
  if (last === undefined) {
    throw new Error("Expected at least one period");
  }
  return last;
}

function gridDays(units: Units, periods: readonly Period[]): Period[] {
  return divideWith(
    units,
    {
      end: lastPeriod(periods).end,
      start: firstPeriod(periods).start,
      unit: "custom",
    },
    "day"
  );
}

function chunkIntoWeeks(days: readonly Period[]): Period[][] {
  const weeks: Period[][] = [];
  for (let index = 0; index < days.length; index += DAYS_PER_WEEK) {
    weeks.push(days.slice(index, index + DAYS_PER_WEEK));
  }
  return weeks;
}

describe.each(ADAPTERS)(
  "yearGridWith() divide operations with %s adapter",
  (_name: string, units: Units) => {
    it("should divide into weeks", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const date = new Date("2024-06-15T00:00:00");
      const weeks = yearGridWith(units, date).periods;

      expect(weeks.length).toBeGreaterThanOrEqual(SHORT_YEAR_WEEKS);
      expect(weeks.length).toBeLessThanOrEqual(LONG_YEAR_WEEKS);

      // Each week should be a proper week period
      for (const week of weeks) {
        expect(week.unit).toBe("week");
        expect(divideWith(units, week, "day")).toHaveLength(DAYS_PER_WEEK);
      }
    });

    it("should divide into days", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const date = new Date("2024-01-01T00:00:00");
      const days = gridDays(units, yearGridWith(units, date).periods);

      // Should have 52 * 7 = 364 or 53 * 7 = 371 days
      expect([SHORT_YEAR_DAYS, LONG_YEAR_DAYS]).toContain(days.length);

      // Each day should start 1ms after the end of the previous day
      const starts = days
        .slice(NEXT_INDEX)
        .map((day: Period) => day.start.getTime());
      const expectedStarts = days
        .slice(FIRST_INDEX, LAST_INDEX)
        .map((day: Period) => day.end.getTime() + ONE_MS);
      expect(starts).toStrictEqual(expectedStarts);
    });
  }
);

describe.each(ADAPTERS)(
  "yearGridWith() edge cases with %s adapter",
  (_name: string, units: Units) => {
    it("should handle year with 53 weeks", { timeout: 5000 }, () => {
      expect.hasAssertions();
      /*
       * 2020 is a leap year that starts on Wednesday.
       * This typically results in 53 weeks when week starts on Monday.
       */
      const date = new Date("2020-01-01T00:00:00");
      const stableYear = yearGridWith(units, date);

      expect(stableYear.periods).toHaveLength(LONG_YEAR_WEEKS);
    });

    it(
      "should include partial weeks at year boundaries",
      { timeout: 5000 },
      () => {
        expect.hasAssertions();
        const date = new Date("2024-01-01T00:00:00");
        const stableYear = yearGridWith(units, date);

        // First week should include days from previous year if needed
        const firstWeek = firstPeriod(stableYear.periods);
        expect(divideWith(units, firstWeek, "day")).toHaveLength(DAYS_PER_WEEK);

        // Last week should include days from next year if needed
        const lastWeek = lastPeriod(stableYear.periods);
        expect(divideWith(units, lastWeek, "day")).toHaveLength(DAYS_PER_WEEK);
      }
    );
  }
);

describe.each(ADAPTERS)(
  "yearGridWith() contribution grid with %s adapter",
  (_name: string, units: Units) => {
    it(
      "should create a proper year grid for contributions",
      { timeout: 5000 },
      () => {
        expect.hasAssertions();
        const date = new Date("2024-01-01T00:00:00");
        const days = gridDays(units, yearGridWith(units, date).periods);

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
  "yearGridWith() grid alignment with %s adapter",
  (_name: string, units: Units) => {
    it(
      "should maintain consistent grid alignment across years",
      { timeout: 5000 },
      () => {
        expect.hasAssertions();

        for (const yearStart of YEAR_STARTS) {
          const date = new Date(yearStart);
          const days = gridDays(units, yearGridWith(units, date).periods);

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
