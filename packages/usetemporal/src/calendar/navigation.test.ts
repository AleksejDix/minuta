import { describe, it, expect } from "vitest";
import { createNativeAdapter } from "../adapters/native";
import { createStableMonth } from "./stableMonth";
import { createStableYear } from "./stableYear";
import { divide } from "../operations/divide";

const adapter = createNativeAdapter({ weekStartsOn: 1 });

describe("stableMonth navigation via createStableMonth", () => {
  const jan2024 = createStableMonth(adapter, 1, new Date(2024, 0, 15));

  it("should create correct 42-day grid", () => {
    const days = divide(adapter, jan2024, "day");
    expect(days.length).toBe(42);
  });

  it("should navigate to next month by creating new stableMonth", () => {
    if (jan2024.type !== "stableMonth") return;
    const nextMonthDate = adapter.add(jan2024.meta.monthStart, 1, "month");
    const feb = createStableMonth(
      adapter,
      jan2024.meta.weekStartsOn,
      nextMonthDate
    );

    expect(feb.type).toBe("stableMonth");
    if (feb.type !== "stableMonth") return;
    expect(feb.meta.monthStart.getMonth()).toBe(1);
    expect(feb.meta.monthStart.getFullYear()).toBe(2024);

    const days = divide(adapter, feb, "day");
    expect(days.length).toBe(42);
  });

  it("should not just shift by duration when navigating", () => {
    if (jan2024.type !== "stableMonth") return;
    const nextMonthDate = adapter.add(jan2024.meta.monthStart, 1, "month");
    const feb = createStableMonth(
      adapter,
      jan2024.meta.weekStartsOn,
      nextMonthDate
    );

    const shiftedStart = new Date(
      jan2024.start.getTime() +
        (jan2024.end.getTime() - jan2024.start.getTime() + 1)
    );
    expect(feb.start.getTime()).not.toBe(shiftedStart.getTime());
  });

  it("should preserve weekStartsOn", () => {
    const sundayGrid = createStableMonth(adapter, 0, new Date(2024, 0, 15));
    expect(sundayGrid.start.getDay()).toBe(0);

    if (sundayGrid.type !== "stableMonth") return;
    const nextMonthDate = adapter.add(sundayGrid.meta.monthStart, 1, "month");
    const febSunday = createStableMonth(adapter, 0, nextMonthDate);
    expect(febSunday.start.getDay()).toBe(0);
    if (febSunday.type !== "stableMonth") return;
    expect(febSunday.meta.weekStartsOn).toBe(0);
  });

  it("should round-trip correctly", () => {
    if (jan2024.type !== "stableMonth") return;
    const nextDate = adapter.add(jan2024.meta.monthStart, 1, "month");
    const feb = createStableMonth(adapter, 1, nextDate);
    if (feb.type !== "stableMonth") return;
    const prevDate = adapter.add(feb.meta.monthStart, -1, "month");
    const janAgain = createStableMonth(adapter, 1, prevDate);

    expect(janAgain.start.getTime()).toBe(jan2024.start.getTime());
    expect(janAgain.end.getTime()).toBe(jan2024.end.getTime());
  });

  it("should handle year boundary crossing", () => {
    const dec2024 = createStableMonth(adapter, 1, new Date(2024, 11, 15));
    if (dec2024.type !== "stableMonth") return;
    const nextDate = adapter.add(dec2024.meta.monthStart, 1, "month");
    const jan2025 = createStableMonth(adapter, 1, nextDate);

    expect(jan2025.type).toBe("stableMonth");
    if (jan2025.type !== "stableMonth") return;
    expect(jan2025.meta.monthStart.getMonth()).toBe(0);
    expect(jan2025.meta.monthStart.getFullYear()).toBe(2025);
  });
});

describe("stableYear navigation via createStableYear", () => {
  const year2024 = createStableYear(adapter, 1, new Date(2024, 5, 15));

  it("should navigate to next year", () => {
    if (year2024.type !== "stableYear") return;
    const nextDate = adapter.add(year2024.meta.yearStart, 1, "year");
    const year2025 = createStableYear(adapter, 1, nextDate);

    expect(year2025.type).toBe("stableYear");
    if (year2025.type !== "stableYear") return;
    expect(year2025.meta.yearStart.getFullYear()).toBe(2025);

    const weeks = divide(adapter, year2025, "week");
    expect(weeks.length).toBeGreaterThanOrEqual(52);
    expect(weeks.length).toBeLessThanOrEqual(54);
  });
});

// go() does not accept PeriodSeries — the type system prevents it at compile time.
