import { describe, expect, it } from "vitest";
import type { Period } from "#src/types";
import { divideWith } from "#src/operations/divide";
import { mergeWith } from "#src/operations/merge";
import { nativeUnits } from "#src/adapters/native/index";
import { periodWith } from "#src/operations/period";
import { shiftWith } from "#src/operations/shift";

const MORNING_HOURS = 12;
const FIRST_INDEX = 0;
const MIDNIGHT = 0;
const LAST_MORNING_HOUR = 11;
const LAST_MINUTE = 59;
const DAYS_365 = 365;
const DAYS_366 = 366;
const YEAR_2024 = 2024;
const YEAR_2025 = 2025;
const JANUARY = 0;
const FEBRUARY = 1;
const DECEMBER = 11;
const FIRST_DAY = 1;
const SECOND_DAY = 2;
const FEB_28 = 28;
const DEC_30 = 30;
const DEC_31 = 31;

const units = nativeUnits();

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
 * Derive a day period from a local calendar date.
 *
 * @param isoDate - Local date as YYYY-MM-DD
 * @returns The day period
 */
function day(isoDate: string): Period {
  return periodWith(units, new Date(`${isoDate}T00:00:00`), "day");
}

describe("regression tests for critical bugs: merge()", () => {
  it(
    "should return undefined for an empty array (bug #1)",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      expect(mergeWith(units, [], "day")).toBeUndefined();
    }
  );

  it(
    "should not set an unaligned unit on a single period",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const single = day("2024-01-15");

      const asWeek = required(mergeWith(units, [single], "week"));
      expect(asWeek.unit).toBe("custom");
      expect(asWeek.start.getTime()).toBe(single.start.getTime());
      expect(asWeek.end.getTime()).toBe(single.end.getTime());
    }
  );

  it(
    "should preserve exact start/end times for partial period merges",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      // Regression test for partial period handling
      const hours = divideWith(units, day("2024-01-15"), "hour");

      // Merge morning hours only (0-11)
      const morningHours = hours.slice(FIRST_INDEX, MORNING_HOURS);
      const merged = required(mergeWith(units, morningHours, "day"));

      expect(merged.unit).toBe("custom");
      expect(merged.start.getHours()).toBe(MIDNIGHT);
      expect(merged.end.getHours()).toBe(LAST_MORNING_HOUR);
      expect(merged.end.getMinutes()).toBe(LAST_MINUTE);
    }
  );
});

describe("regression tests for critical bugs: merge() references", () => {
  it(
    "should preserve reference date from first period",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      // Regression test for reference date preservation
      const first = day("2024-01-10");
      const periods = [first, day("2024-01-11"), day("2024-01-12")];

      const merged = required(mergeWith(units, periods, "week"));
      expect(merged.start.getTime()).toBe(first.start.getTime());
    }
  );
});

describe("regression tests for critical bugs: shiftWith() exact days", () => {
  it(
    "should add exact days without year-based shortcuts (365 days)",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      // 2024 is a leap year (366 days), so 365 days from Jan 1 = Dec 31
      const result365 = shiftWith(units, day("2024-01-01"), DAYS_365);
      expect(result365.start.getFullYear()).toBe(YEAR_2024);
      // December
      expect(result365.start.getMonth()).toBe(DECEMBER);
      expect(result365.start.getDate()).toBe(DEC_31);
    }
  );

  it(
    "should add exact days without year-based shortcuts (366 days)",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      // 366 days from Jan 1, 2024 = Jan 1, 2025
      const result366 = shiftWith(units, day("2024-01-01"), DAYS_366);
      expect(result366.start.getFullYear()).toBe(YEAR_2025);
      expect(result366.start.getMonth()).toBe(JANUARY);
      expect(result366.start.getDate()).toBe(FIRST_DAY);
    }
  );
});

describe("regression tests for critical bugs: shiftWith() multiple years", () => {
  it(
    "should handle multiple year navigation correctly",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      // 2023 is not a leap year (365 days), so 365 days = Jan 1, 2024
      const oneYear = shiftWith(units, day("2023-01-01"), DAYS_365);
      expect(oneYear.start.getFullYear()).toBe(YEAR_2024);
      expect(oneYear.start.getMonth()).toBe(JANUARY);
      expect(oneYear.start.getDate()).toBe(FIRST_DAY);
    }
  );

  it(
    "should handle multiple year navigation correctly (second year)",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const oneYear = shiftWith(units, day("2023-01-01"), DAYS_365);
      // Then 2024 is a leap year, so another 365 days = Dec 31, 2024
      const twoYears = shiftWith(units, oneYear, DAYS_365);
      expect(twoYears.start.getFullYear()).toBe(YEAR_2024);
      expect(twoYears.start.getMonth()).toBe(DECEMBER);
      expect(twoYears.start.getDate()).toBe(DEC_31);
    }
  );
});

describe("regression tests for critical bugs: shiftWith() leap years", () => {
  it("should handle negative large day offsets", { timeout: 5000 }, () => {
    expect.hasAssertions();
    /*
     * 2024 is a leap year, so going back 365 days from Jan 1, 2025
     * lands on Jan 2, 2024 (not Jan 1, because 2024 has 366 days)
     */
    const yearBefore = shiftWith(units, day("2025-01-01"), -DAYS_365);
    expect(yearBefore.start.getFullYear()).toBe(YEAR_2024);
    expect(yearBefore.start.getMonth()).toBe(JANUARY);
    expect(yearBefore.start.getDate()).toBe(SECOND_DAY);
  });

  it("should handle leap year boundary crossing", { timeout: 5000 }, () => {
    expect.hasAssertions();
    // Feb 29, 2024 + 365 days = Feb 28, 2025 (exact day math)
    const nextYear = shiftWith(units, day("2024-02-29"), DAYS_365);
    expect(nextYear.start.getFullYear()).toBe(YEAR_2025);
    // February
    expect(nextYear.start.getMonth()).toBe(FEBRUARY);
    expect(nextYear.start.getDate()).toBe(FEB_28);
  });

  it(
    "should handle leap year boundary crossing (Dec 31)",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      // Dec 31, 2023 + 365 days = Dec 30, 2024 (2024 is leap year)
      const afterYear = shiftWith(units, day("2023-12-31"), DAYS_365);
      expect(afterYear.start.getFullYear()).toBe(YEAR_2024);
      expect(afterYear.start.getMonth()).toBe(DECEMBER);
      expect(afterYear.start.getDate()).toBe(DEC_30);
    }
  );
});
