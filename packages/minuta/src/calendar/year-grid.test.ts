import type { Period, Units } from "#src/types";
import { describe, expect, it } from "vitest";
import { dateFnsUnits } from "#src/adapters/date-fns/index";
import { luxonUnits } from "#src/adapters/luxon/index";
import { nativeUnits } from "#src/adapters/native/index";
import { yearGridWith } from "./year-grid";

const SUNDAY = 0;
const MONDAY = 1;
const DECEMBER = 11;
const SHORT_YEAR_WEEKS = 52;
const LONG_YEAR_WEEKS = 53;
const LAST_INDEX = -1;
const JAN_5 = 5;
const DEC_26 = 26;
const DEC_30 = 30;
const YEAR_2022 = 2022;
const YEAR_2024 = 2024;
const YEAR_2025 = 2025;

const ADAPTERS = [
  ["native", nativeUnits({ weekStartsOn: MONDAY })],
  ["date-fns", dateFnsUnits({ weekStartsOn: MONDAY })],
  ["luxon", luxonUnits({ weekStartsOn: MONDAY })],
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

describe.each(ADAPTERS)(
  "yearGridWith() basics with %s adapter",
  (_name: string, units: Units) => {
    it("should create a stableYear period", { timeout: 5000 }, () => {
      expect.hasAssertions();
      // June 15, 2024
      const date = new Date("2024-06-15T00:00:00");
      const stableYear = yearGridWith(units, date);

      expect(stableYear).toBeDefined();
      expect(stableYear.periods).toBeDefined();
      expect(firstPeriod(stableYear.periods).start).toBeInstanceOf(Date);
      expect(lastPeriod(stableYear.periods).end).toBeInstanceOf(Date);
    });

    it("should have 52 or 53 weeks", { timeout: 5000 }, () => {
      expect.hasAssertions();
      // Jan 1, 2024
      const date = new Date("2024-01-01T00:00:00");
      const stableYear = yearGridWith(units, date);
      const weeks = stableYear.periods;

      expect([SHORT_YEAR_WEEKS, LONG_YEAR_WEEKS]).toContain(weeks.length);
    });

    it(
      "should start on the configured weekStartsOn day",
      { timeout: 5000 },
      () => {
        expect.hasAssertions();
        const date = new Date("2024-01-01T00:00:00");
        const stableYear = yearGridWith(units, date);

        expect(firstPeriod(stableYear.periods).start.getDay()).toBe(MONDAY);
      }
    );

    it("should end on the day before weekStartsOn", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const date = new Date("2024-01-01T00:00:00");
      const stableYear = yearGridWith(units, date);

      // Should end on Sunday if week starts on Monday
      expect(lastPeriod(stableYear.periods).end.getDay()).toBe(SUNDAY);
    });
  }
);

describe.each(ADAPTERS)(
  "yearGridWith() year boundaries with %s adapter",
  (_name: string, units: Units) => {
    it(
      "should handle 2024 (leap year, starts on Monday)",
      { timeout: 5000 },
      () => {
        expect.hasAssertions();
        const date = new Date("2024-01-01T00:00:00");
        const stableYear = yearGridWith(units, date);
        const last = lastPeriod(stableYear.periods);

        /*
         * 2024 starts on Monday, ends on Tuesday.
         * Grid: Jan 1, 2024 (Mon) to Jan 5, 2025 (Sun) = 53 weeks
         */
        expect(stableYear.periods).toHaveLength(LONG_YEAR_WEEKS);
        expect(firstPeriod(stableYear.periods).start).toStrictEqual(
          new Date("2024-01-01T00:00:00")
        );
        expect(last.end.getDate()).toBe(JAN_5);
        expect(last.end.getFullYear()).toBe(YEAR_2025);
      }
    );

    it(
      "should handle 2023 (non-leap year, starts on Sunday)",
      { timeout: 5000 },
      () => {
        expect.hasAssertions();
        const date = new Date("2023-01-01T00:00:00");
        const stableYear = yearGridWith(units, date);
        const { start } = firstPeriod(stableYear.periods);

        /*
         * 2023 starts on Sunday, ends on Sunday.
         * Grid starts Dec 26, 2022 (Monday) for full weeks.
         */
        expect(stableYear.periods).toHaveLength(LONG_YEAR_WEEKS);
        expect(start.getFullYear()).toBe(YEAR_2022);
        expect(start.getMonth()).toBe(DECEMBER);
        expect(start.getDate()).toBe(DEC_26);
      }
    );
  }
);

describe.each(ADAPTERS)(
  "yearGridWith() mid-week year start with %s adapter",
  (_name: string, units: Units) => {
    it("should handle 2025 (starts on Wednesday)", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const date = new Date("2025-01-01T00:00:00");
      const stableYear = yearGridWith(units, date);
      const { start } = firstPeriod(stableYear.periods);

      /*
       * 2025 starts on Wednesday, ends on Wednesday.
       * Grid: Dec 30, 2024 (Mon) to Jan 4, 2026 (Sun)
       */
      expect(stableYear.periods).toHaveLength(LONG_YEAR_WEEKS);
      expect(start.getFullYear()).toBe(YEAR_2024);
      expect(start.getMonth()).toBe(DECEMBER);
      expect(start.getDate()).toBe(DEC_30);
    });
  }
);
