import { describe, expect, it } from "vitest";
import { divide, period } from "#src/index";
import { monthGridWith, yearGridWith } from "#src/calendar";
import type { Period } from "#src/types";
import { nativeUnits } from "#src/adapters/native/index";

const MONTH_GRID_DAYS = 42;
const MIN_WEEKS_PER_YEAR = 52;
const MAX_WEEKS_PER_YEAR = 53;
const DAYS_IN_52_WEEKS = 364;
const DAYS_IN_53_WEEKS = 371;
const DAYS_PER_WEEK = 7;
const MONTHS_PER_YEAR = 12;
const YEAR_2024 = 2024;
const MID_MONTH_DAY = 15;
const FIRST_INDEX = 0;
const LAST_INDEX = -1;
const SUNDAY = 0;
const MONDAY = 1;
const WEDNESDAY = 3;
const SATURDAY = 6;

/**
 * Narrow away undefined, failing the test otherwise.
 *
 * @param value - Value expected to be present
 * @returns The value
 */
function required<TValue>(value: TValue | undefined): TValue {
  if (value === undefined) {
    throw new Error("Expected a value");
  }
  return value;
}

/**
 * Split each week of a grid into days.
 *
 * @param weeks - Week periods
 * @returns All days of all weeks
 */
function daysOf(weeks: readonly Period[]): Period[] {
  return weeks.flatMap((week: Period) => divide(week, "day"));
}

describe("calendar units integration: monthGridWith()", () => {
  it("should create monthGrid with 42 day periods", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const grid = monthGridWith(
      nativeUnits({ weekStartsOn: MONDAY }),
      new Date("2024-01-01T00:00:00")
    );

    expect(grid).toBeDefined();
    expect(grid.periods).toHaveLength(MONTH_GRID_DAYS);
    expect(required(grid.periods[FIRST_INDEX]).unit).toBe("day");
    expect(grid.monthStart).toBeInstanceOf(Date);
  });
});

describe("calendar units integration: yearGridWith()", () => {
  it("should create yearGrid with week periods", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const grid = yearGridWith(
      nativeUnits({ weekStartsOn: MONDAY }),
      new Date("2024-06-15T00:00:00")
    );

    expect(grid).toBeDefined();
    expect(grid.periods.length).toBeGreaterThanOrEqual(MIN_WEEKS_PER_YEAR);
    expect(grid.yearStart).toBeInstanceOf(Date);
  });

  it("should create GitHub-style contribution grid", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const grid = yearGridWith(
      nativeUnits({ weekStartsOn: MONDAY }),
      new Date("2024-06-15T00:00:00")
    );

    // Flatten weeks into days
    const days = daysOf(grid.periods);

    // Should have 52 or 53 weeks worth of days
    expect([DAYS_IN_52_WEEKS, DAYS_IN_53_WEEKS]).toContain(days.length);

    // First day should be Monday
    expect(required(days[FIRST_INDEX]).start.getDay()).toBe(MONDAY);

    // Last day should be Sunday
    expect(required(days.at(LAST_INDEX)).start.getDay()).toBe(SUNDAY);
  });
});

describe("calendar units integration: yearGridWith() transitions", () => {
  it("should handle year transitions correctly", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const years = ["2022", "2023", "2024", "2025"];

    for (const year of years) {
      const grid = yearGridWith(
        nativeUnits({ weekStartsOn: MONDAY }),
        new Date(`${year}-01-01T00:00:00`)
      );

      expect([MIN_WEEKS_PER_YEAR, MAX_WEEKS_PER_YEAR]).toContain(
        grid.periods.length
      );

      for (const week of grid.periods) {
        const days = divide(week, "day");
        expect(days).toHaveLength(DAYS_PER_WEEK);
      }
    }
  });
});

describe("calendar units integration: combined usage", () => {
  it(
    "should create consistent month grids for a full year",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      for (const month of Array.from({ length: MONTHS_PER_YEAR }).keys()) {
        const grid = monthGridWith(
          nativeUnits({ weekStartsOn: MONDAY }),
          new Date(YEAR_2024, month, MID_MONTH_DAY)
        );
        expect(grid.periods).toHaveLength(MONTH_GRID_DAYS);
      }
    }
  );

  it("should allow drilling from year to months", { timeout: 5000 }, () => {
    expect.hasAssertions();

    const regularYear = period(new Date("2024-06-15T00:00:00"), "year");
    const months = divide(regularYear, "month");

    for (const month of months) {
      const grid = monthGridWith(
        nativeUnits({ weekStartsOn: MONDAY }),
        month.start
      );
      expect(grid.periods).toHaveLength(MONTH_GRID_DAYS);
    }
  });
});

describe("calendar units integration: weekStartsOn configurations", () => {
  it("should adapt yearGrid to Sunday start", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const grid = yearGridWith(
      nativeUnits({ weekStartsOn: SUNDAY }),
      new Date("2024-01-01T00:00:00")
    );
    const days = daysOf(grid.periods);

    expect(required(days[FIRST_INDEX]).start.getDay()).toBe(SUNDAY);
    expect(required(days.at(LAST_INDEX)).start.getDay()).toBe(SATURDAY);
  });

  it("should adapt monthGrid to Wednesday start", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const grid = monthGridWith(
      nativeUnits({ weekStartsOn: WEDNESDAY }),
      new Date("2024-06-15T00:00:00")
    );

    expect(required(grid.periods[FIRST_INDEX]).start.getDay()).toBe(WEDNESDAY);
    expect(grid.periods).toHaveLength(MONTH_GRID_DAYS);
  });
});
