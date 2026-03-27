import { describe, it, expect } from "vitest";
import { createNativeAdapter } from "../adapters/native";
import { createStableMonth } from "./stableMonth";
import { createStableYear } from "./stableYear";
import { next, previous, go } from "../operations";
import { divide } from "../operations/divide";

const adapter = createNativeAdapter({ weekStartsOn: 1 });

describe("stableMonth navigation", () => {
  const jan2024 = createStableMonth(adapter, 1, new Date(2024, 0, 15));

  it("should preserve type on next()", () => {
    const feb = next(adapter, jan2024);
    expect(feb.type).toBe("stableMonth");
  });

  it("should preserve type on previous()", () => {
    const dec = previous(adapter, jan2024);
    expect(dec.type).toBe("stableMonth");
  });

  it("should preserve type on go()", () => {
    const march = go(adapter, jan2024, 2);
    expect(march.type).toBe("stableMonth");
  });

  it("should reconstruct correct grid for next month", () => {
    const feb = next(adapter, jan2024);
    // Feb 2024 stableMonth should reference February
    expect(feb.date.getMonth()).toBe(1); // February
    expect(feb.date.getFullYear()).toBe(2024);
    // Should be 42 days
    const days = divide(adapter, feb, "day");
    expect(days.length).toBe(42);
  });

  it("should not just shift by duration", () => {
    const feb = next(adapter, jan2024);
    // A duration-shifted stableMonth would start exactly 42 days after jan2024.start
    // A properly reconstructed one starts at the week containing Feb 1
    const shiftedStart = new Date(
      jan2024.start.getTime() +
        (jan2024.end.getTime() - jan2024.start.getTime() + 1)
    );
    // These should differ because grid alignment depends on weekday of month start
    expect(feb.start.getTime()).not.toBe(shiftedStart.getTime());
  });

  it("should preserve weekStartsOn through navigation", () => {
    const sundayStart = createStableMonth(adapter, 0, new Date(2024, 0, 15));
    const nextSunday = next(adapter, sundayStart);
    expect(nextSunday.meta?.weekStartsOn).toBe(0);
    // Grid should start on a Sunday
    expect(nextSunday.start.getDay()).toBe(0);
  });

  it("should round-trip: previous(next(p)) returns same month", () => {
    const roundTrip = previous(adapter, next(adapter, jan2024));
    expect(roundTrip.date.getMonth()).toBe(jan2024.date.getMonth());
    expect(roundTrip.date.getFullYear()).toBe(jan2024.date.getFullYear());
    expect(roundTrip.start.getTime()).toBe(jan2024.start.getTime());
    expect(roundTrip.end.getTime()).toBe(jan2024.end.getTime());
  });

  it("should handle year boundary crossing", () => {
    const dec2024 = createStableMonth(adapter, 1, new Date(2024, 11, 15));
    const jan2025 = next(adapter, dec2024);
    expect(jan2025.date.getMonth()).toBe(0);
    expect(jan2025.date.getFullYear()).toBe(2025);
    expect(jan2025.type).toBe("stableMonth");
  });
});

describe("stableYear navigation", () => {
  const year2024 = createStableYear(adapter, 1, new Date(2024, 5, 15));

  it("should preserve type on next()", () => {
    const year2025 = next(adapter, year2024);
    expect(year2025.type).toBe("stableYear");
  });

  it("should reconstruct correct grid for next year", () => {
    const year2025 = next(adapter, year2024);
    expect(year2025.date.getFullYear()).toBe(2025);
    // Should contain 52 or 53 weeks
    const weeks = divide(adapter, year2025, "week");
    expect(weeks.length).toBeGreaterThanOrEqual(52);
    expect(weeks.length).toBeLessThanOrEqual(54);
  });

  it("should preserve weekStartsOn through navigation", () => {
    const sundayYear = createStableYear(adapter, 0, new Date(2024, 5, 15));
    const nextYear = next(adapter, sundayYear);
    expect(nextYear.meta?.weekStartsOn).toBe(0);
    expect(nextYear.start.getDay()).toBe(0);
  });

  it("should round-trip: previous(next(p)) returns same year", () => {
    const roundTrip = previous(adapter, next(adapter, year2024));
    expect(roundTrip.date.getFullYear()).toBe(year2024.date.getFullYear());
  });
});

describe("plain custom periods still use duration shifting", () => {
  it("should shift custom period by duration", () => {
    const custom = {
      start: new Date(2024, 0, 1),
      end: new Date(2024, 0, 10, 23, 59, 59, 999),
      type: "custom" as const,
      date: new Date(2024, 0, 5),
    };

    const shifted = next(adapter, custom);
    expect(shifted.type).toBe("custom");
    // Should start right after the original ends
    expect(shifted.start.getTime()).toBe(custom.end.getTime() + 1);
  });
});
