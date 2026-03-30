import { describe, it, expect } from "vitest";
import { createNativeAdapter } from "../adapters/native";
import { createStableMonth } from "./stableMonth";
import { createStableYear } from "./stableYear";

const adapter = createNativeAdapter({ weekStartsOn: 1 });

describe("stableMonth navigation via createStableMonth", () => {
  const jan2024 = createStableMonth(adapter, 1, new Date(2024, 0, 15));

  it("should create correct 42-day grid", () => {
    expect(jan2024.periods.length).toBe(42);
  });

  it("should navigate to next month by creating new stableMonth", () => {
    const nextMonthDate = adapter.add(jan2024.monthStart, 1, "month");
    const feb = createStableMonth(adapter, jan2024.weekStartsOn, nextMonthDate);

    expect(feb.periods.length).toBe(42);
    expect(feb.monthStart.getMonth()).toBe(1);
    expect(feb.monthStart.getFullYear()).toBe(2024);
  });

  it("should not just shift by duration when navigating", () => {
    const nextMonthDate = adapter.add(jan2024.monthStart, 1, "month");
    const feb = createStableMonth(adapter, jan2024.weekStartsOn, nextMonthDate);

    const janStart = jan2024.periods[0].start;
    const janEnd = jan2024.periods[jan2024.periods.length - 1].end;
    const shiftedStart = new Date(
      janStart.getTime() + (janEnd.getTime() - janStart.getTime() + 1)
    );
    expect(feb.periods[0].start.getTime()).not.toBe(shiftedStart.getTime());
  });

  it("should preserve weekStartsOn", () => {
    const sundayGrid = createStableMonth(adapter, 0, new Date(2024, 0, 15));
    expect(sundayGrid.periods[0].start.getDay()).toBe(0);

    const nextMonthDate = adapter.add(sundayGrid.monthStart, 1, "month");
    const febSunday = createStableMonth(adapter, 0, nextMonthDate);
    expect(febSunday.periods[0].start.getDay()).toBe(0);
    expect(febSunday.weekStartsOn).toBe(0);
  });

  it("should round-trip correctly", () => {
    const nextDate = adapter.add(jan2024.monthStart, 1, "month");
    const feb = createStableMonth(adapter, 1, nextDate);

    const prevDate = adapter.add(feb.monthStart, -1, "month");
    const janAgain = createStableMonth(adapter, 1, prevDate);

    expect(janAgain.periods[0].start.getTime()).toBe(
      jan2024.periods[0].start.getTime()
    );
  });

  it("should handle year boundary crossing", () => {
    const dec2024 = createStableMonth(adapter, 1, new Date(2024, 11, 15));

    const nextDate = adapter.add(dec2024.monthStart, 1, "month");
    const jan2025 = createStableMonth(adapter, 1, nextDate);

    expect(jan2025.periods.length).toBe(42);
    expect(jan2025.monthStart.getMonth()).toBe(0);
    expect(jan2025.monthStart.getFullYear()).toBe(2025);
  });
});

describe("stableYear navigation via createStableYear", () => {
  const year2024 = createStableYear(adapter, 1, new Date(2024, 5, 15));

  it("should navigate to next year", () => {
    const nextDate = adapter.add(year2024.yearStart, 1, "year");
    const year2025 = createStableYear(adapter, 1, nextDate);

    expect(year2025.yearStart.getFullYear()).toBe(2025);
    expect(year2025.periods.length).toBeGreaterThanOrEqual(52);
    expect(year2025.periods.length).toBeLessThanOrEqual(54);
  });
});
