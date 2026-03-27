import { describe, it, expect } from "vitest";
import { period } from "./period";

import { createNativeAdapter } from "../adapters/native";

describe("period with custom options", () => {
  const adapter = createNativeAdapter();

  it("should create custom period with correct properties", () => {
    const start = new Date(2024, 0, 1);
    const end = new Date(2024, 0, 14, 23, 59, 59, 999);

    const customPeriod = period(adapter, { start, end });

    expect(customPeriod.type).toBe("custom");
    expect(customPeriod.start).toEqual(start);
    expect(customPeriod.end).toEqual(end);
  });

  it("should calculate middle value correctly", () => {
    const start = new Date(2024, 0, 1);
    const end = new Date(2024, 0, 31);

    const customPeriod = period(adapter, { start, end });

    const expectedMiddle = new Date((start.getTime() + end.getTime()) / 2);
    expect(customPeriod.date).toEqual(expectedMiddle);
  });

  it("should handle same start and end dates", () => {
    const date = new Date(2024, 0, 15, 12, 0, 0);

    const customPeriod = period(adapter, { start: date, end: date });

    expect(customPeriod.start).toEqual(date);
    expect(customPeriod.end).toEqual(date);
    expect(customPeriod.date).toEqual(date);
  });

  it("should handle time components", () => {
    const start = new Date(2024, 0, 1, 9, 0, 0);
    const end = new Date(2024, 0, 1, 17, 0, 0);

    const customPeriod = period(adapter, { start, end });

    expect(customPeriod.start.getHours()).toBe(9);
    expect(customPeriod.end.getHours()).toBe(17);
    expect(customPeriod.date.getHours()).toBe(13); // Middle of workday
  });

  it("should handle cross-month periods", () => {
    const start = new Date(2024, 0, 15);
    const end = new Date(2024, 1, 15);

    const customPeriod = period(adapter, { start, end });

    expect(customPeriod.start.getMonth()).toBe(0); // January
    expect(customPeriod.end.getMonth()).toBe(1); // February
    expect(customPeriod.date.getMonth()).toBe(0); // Still January (around Jan 30)
  });

  it("should handle cross-year periods", () => {
    const start = new Date(2023, 11, 15); // Dec 15, 2023
    const end = new Date(2024, 0, 15); // Jan 15, 2024

    const customPeriod = period(adapter, { start, end });

    expect(customPeriod.start.getFullYear()).toBe(2023);
    expect(customPeriod.end.getFullYear()).toBe(2024);
    // Middle should be around Dec 30, 2023
    expect(customPeriod.date.getFullYear()).toBe(2023);
    expect(customPeriod.date.getMonth()).toBe(11);
  });

  it("should handle millisecond precision", () => {
    const start = new Date(2024, 0, 1, 0, 0, 0, 0);
    const end = new Date(2024, 0, 1, 0, 0, 0, 999);

    const customPeriod = period(adapter, { start, end });

    // JavaScript Date rounds milliseconds to integers
    expect(customPeriod.date.getMilliseconds()).toBe(499);
  });

  it("should work alongside standard period function", () => {
    const date = new Date(2024, 0, 15);

    // Standard period
    const monthPeriod = period(adapter, date, "month");
    expect(monthPeriod.type).toBe("month");

    // Custom period
    const customPeriod = period(adapter, {
      start: new Date(2024, 0, 1),
      end: new Date(2024, 0, 31),
    });
    expect(customPeriod.type).toBe("custom");
  });

  it("should throw for non-adapter units", () => {
    const date = new Date(2024, 0, 15);

    expect(() => period(adapter, date, "custom" as any)).toThrow(
      'Cannot create period with unit "custom"'
    );
    expect(() => period(adapter, date, "stableMonth" as any)).toThrow(
      'Cannot create period with unit "stableMonth"'
    );
    expect(() => period(adapter, date, "stableYear" as any)).toThrow(
      'Cannot create period with unit "stableYear"'
    );
  });
});
