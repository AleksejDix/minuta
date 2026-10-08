import { describe, expect, it } from "vitest";
import { firstOf, lastOf } from "./grid-test-helpers";
import { monthGridWith } from "./month-grid";
import { nativeUnits } from "#src/adapters/native/index";
import { yearGridWith } from "./year-grid";

const SUNDAY = 0;
const MONDAY = 1;
const JANUARY = 0;
const FEBRUARY = 1;
const NEXT = 1;
const PREVIOUS = -1;
const ONE_MS = 1;
const GRID_DAYS = 42;
const YEAR_2024 = 2024;
const YEAR_2025 = 2025;
const MIN_WEEKS = 52;
const MAX_WEEKS = 54;

const units = nativeUnits({ weekStartsOn: MONDAY });
const sundayUnits = nativeUnits({ weekStartsOn: SUNDAY });

const jan2024 = monthGridWith(units, new Date("2024-01-15T00:00:00"));

describe("monthGridWith() navigation forward", () => {
  it("should create correct 42-day grid", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(jan2024.periods).toHaveLength(GRID_DAYS);
  });

  it(
    "should navigate to next month by creating new stableMonth",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const nextMonthDate = units.month.add(jan2024.monthStart, NEXT);
      const feb = monthGridWith(units, nextMonthDate);

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
      const nextMonthDate = units.month.add(jan2024.monthStart, NEXT);
      const feb = monthGridWith(units, nextMonthDate);

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

describe("monthGridWith() navigation consistency", () => {
  it("should preserve weekStartsOn", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const sundayGrid = monthGridWith(
      sundayUnits,
      new Date("2024-01-15T00:00:00")
    );
    expect(firstOf(sundayGrid.periods).start.getDay()).toBe(SUNDAY);

    const nextMonthDate = sundayUnits.month.add(sundayGrid.monthStart, NEXT);
    const febSunday = monthGridWith(sundayUnits, nextMonthDate);
    expect(firstOf(febSunday.periods).start.getDay()).toBe(SUNDAY);
    expect(febSunday.weekStartsOn).toBe(SUNDAY);
  });

  it("should round-trip correctly", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const nextDate = units.month.add(jan2024.monthStart, NEXT);
    const feb = monthGridWith(units, nextDate);

    const prevDate = units.month.add(feb.monthStart, PREVIOUS);
    const janAgain = monthGridWith(units, prevDate);

    expect(firstOf(janAgain.periods).start.getTime()).toBe(
      firstOf(jan2024.periods).start.getTime()
    );
  });

  it("should handle year boundary crossing", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const dec2024 = monthGridWith(units, new Date("2024-12-15T00:00:00"));

    const nextDate = units.month.add(dec2024.monthStart, NEXT);
    const jan2025 = monthGridWith(units, nextDate);

    expect(jan2025.periods).toHaveLength(GRID_DAYS);
    expect(jan2025.monthStart.getMonth()).toBe(JANUARY);
    expect(jan2025.monthStart.getFullYear()).toBe(YEAR_2025);
  });
});

describe("yearGridWith() navigation", () => {
  const year2024 = yearGridWith(units, new Date("2024-06-15T00:00:00"));

  it("should navigate to next year", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const nextDate = units.year.add(year2024.yearStart, NEXT);
    const year2025 = yearGridWith(units, nextDate);

    expect(year2025.yearStart.getFullYear()).toBe(YEAR_2025);
    expect(year2025.periods.length).toBeGreaterThanOrEqual(MIN_WEEKS);
    expect(year2025.periods.length).toBeLessThanOrEqual(MAX_WEEKS);
  });
});
