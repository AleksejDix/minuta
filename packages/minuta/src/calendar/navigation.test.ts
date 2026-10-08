import { describe, expect, it } from "vitest";
import type { ReadonlyPeriod } from "#src/types";
import { createNativeAdapter } from "#src/adapters/native/index";
import { createStableMonth } from "./stable-month";
import { createStableYear } from "./stable-year";

const SUNDAY = 0;
const MONDAY = 1;
const JANUARY = 0;
const FEBRUARY = 1;
const NEXT = 1;
const PREVIOUS = -1;
const LAST_INDEX = -1;
const ONE_MS = 1;
const GRID_DAYS = 42;
const YEAR_2024 = 2024;
const YEAR_2025 = 2025;
const MIN_WEEKS = 52;
const MAX_WEEKS = 54;

const adapter = createNativeAdapter({ weekStartsOn: 1 });

function firstOf(periods: readonly ReadonlyPeriod[]): ReadonlyPeriod {
  const [first] = periods;
  if (first === undefined) {
    throw new Error("Expected at least one period");
  }
  return first;
}

function lastOf(periods: readonly ReadonlyPeriod[]): ReadonlyPeriod {
  const last = periods.at(LAST_INDEX);
  if (last === undefined) {
    throw new Error("Expected at least one period");
  }
  return last;
}

const jan2024 = createStableMonth(
  adapter,
  MONDAY,
  new Date("2024-01-15T00:00:00")
);

describe("createStableMonth() navigation forward", () => {
  it("should create correct 42-day grid", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(jan2024.periods).toHaveLength(GRID_DAYS);
  });

  it(
    "should navigate to next month by creating new stableMonth",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const nextMonthDate = adapter.add(jan2024.monthStart, NEXT, "month");
      const feb = createStableMonth(
        adapter,
        jan2024.weekStartsOn,
        nextMonthDate
      );

      expect(feb.periods).toHaveLength(GRID_DAYS);
      expect(feb.monthStart.getMonth()).toBe(FEBRUARY);
      expect(feb.monthStart.getFullYear()).toBe(YEAR_2024);
    }
  );

  it(
    "should not just shift by duration when navigating",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const nextMonthDate = adapter.add(jan2024.monthStart, NEXT, "month");
      const feb = createStableMonth(
        adapter,
        jan2024.weekStartsOn,
        nextMonthDate
      );

      const janStart = firstOf(jan2024.periods).start;
      const janEnd = lastOf(jan2024.periods).end;
      const shiftedStart = new Date(
        janStart.getTime() + (janEnd.getTime() - janStart.getTime() + ONE_MS)
      );
      expect(firstOf(feb.periods).start.getTime()).not.toBe(
        shiftedStart.getTime()
      );
    }
  );
});

describe("createStableMonth() navigation consistency", () => {
  it("should preserve weekStartsOn", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const sundayGrid = createStableMonth(
      adapter,
      SUNDAY,
      new Date("2024-01-15T00:00:00")
    );
    expect(firstOf(sundayGrid.periods).start.getDay()).toBe(SUNDAY);

    const nextMonthDate = adapter.add(sundayGrid.monthStart, NEXT, "month");
    const febSunday = createStableMonth(adapter, SUNDAY, nextMonthDate);
    expect(firstOf(febSunday.periods).start.getDay()).toBe(SUNDAY);
    expect(febSunday.weekStartsOn).toBe(SUNDAY);
  });

  it("should round-trip correctly", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const nextDate = adapter.add(jan2024.monthStart, NEXT, "month");
    const feb = createStableMonth(adapter, MONDAY, nextDate);

    const prevDate = adapter.add(feb.monthStart, PREVIOUS, "month");
    const janAgain = createStableMonth(adapter, MONDAY, prevDate);

    expect(firstOf(janAgain.periods).start.getTime()).toBe(
      firstOf(jan2024.periods).start.getTime()
    );
  });

  it("should handle year boundary crossing", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const dec2024 = createStableMonth(
      adapter,
      MONDAY,
      new Date("2024-12-15T00:00:00")
    );

    const nextDate = adapter.add(dec2024.monthStart, NEXT, "month");
    const jan2025 = createStableMonth(adapter, MONDAY, nextDate);

    expect(jan2025.periods).toHaveLength(GRID_DAYS);
    expect(jan2025.monthStart.getMonth()).toBe(JANUARY);
    expect(jan2025.monthStart.getFullYear()).toBe(YEAR_2025);
  });
});

describe("createStableYear() navigation", () => {
  const year2024 = createStableYear(
    adapter,
    MONDAY,
    new Date("2024-06-15T00:00:00")
  );

  it("should navigate to next year", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const nextDate = adapter.add(year2024.yearStart, NEXT, "year");
    const year2025 = createStableYear(adapter, MONDAY, nextDate);

    expect(year2025.yearStart.getFullYear()).toBe(YEAR_2025);
    expect(year2025.periods.length).toBeGreaterThanOrEqual(MIN_WEEKS);
    expect(year2025.periods.length).toBeLessThanOrEqual(MAX_WEEKS);
  });
});
