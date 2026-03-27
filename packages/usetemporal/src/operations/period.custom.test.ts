import { describe, it, expect } from "vitest";
import { derivePeriod, createPeriod } from "./period";
import { createNativeAdapter } from "../adapters/native";

describe("derivePeriod", () => {
  const adapter = createNativeAdapter();

  it("should create a month period", () => {
    const date = new Date(2024, 0, 15);
    const monthPeriod = derivePeriod(adapter, date, "month");
    expect(monthPeriod.type).toBe("month");
    expect(monthPeriod.start.getMonth()).toBe(0);
    expect(monthPeriod.start.getDate()).toBe(1);
  });

  it("should throw for non-adapter units", () => {
    const date = new Date(2024, 0, 15);

    expect(() => derivePeriod(adapter, date, "custom" as any)).toThrow(
      'Cannot derive period for unit "custom"'
    );
    expect(() => derivePeriod(adapter, date, "stableMonth" as any)).toThrow(
      'Cannot derive period for unit "stableMonth"'
    );
    expect(() => derivePeriod(adapter, date, "stableYear" as any)).toThrow(
      'Cannot derive period for unit "stableYear"'
    );
  });
});

describe("createPeriod", () => {
  it("should create custom period with correct properties", () => {
    const start = new Date(2024, 0, 1);
    const end = new Date(2024, 0, 14, 23, 59, 59, 999);

    const customPeriod = createPeriod(start, end);

    expect(customPeriod.type).toBe("custom");
    expect(customPeriod.start).toEqual(start);
    expect(customPeriod.end).toEqual(end);
  });

  it("should calculate midpoint as reference date", () => {
    const start = new Date(2024, 0, 1);
    const end = new Date(2024, 0, 31);

    const customPeriod = createPeriod(start, end);

    const expectedMiddle = new Date((start.getTime() + end.getTime()) / 2);
    expect(customPeriod.date).toEqual(expectedMiddle);
  });

  it("should handle same start and end dates", () => {
    const date = new Date(2024, 0, 15, 12, 0, 0);

    const customPeriod = createPeriod(date, date);

    expect(customPeriod.start).toEqual(date);
    expect(customPeriod.end).toEqual(date);
    expect(customPeriod.date).toEqual(date);
  });

  it("should handle time components", () => {
    const start = new Date(2024, 0, 1, 9, 0, 0);
    const end = new Date(2024, 0, 1, 17, 0, 0);

    const customPeriod = createPeriod(start, end);

    expect(customPeriod.start.getHours()).toBe(9);
    expect(customPeriod.end.getHours()).toBe(17);
    expect(customPeriod.date.getHours()).toBe(13);
  });

  it("should handle cross-month periods", () => {
    const start = new Date(2024, 0, 15);
    const end = new Date(2024, 1, 15);

    const customPeriod = createPeriod(start, end);

    expect(customPeriod.start.getMonth()).toBe(0);
    expect(customPeriod.end.getMonth()).toBe(1);
  });

  it("should handle cross-year periods", () => {
    const start = new Date(2023, 11, 15);
    const end = new Date(2024, 0, 15);

    const customPeriod = createPeriod(start, end);

    expect(customPeriod.start.getFullYear()).toBe(2023);
    expect(customPeriod.end.getFullYear()).toBe(2024);
  });

  it("should handle millisecond precision", () => {
    const start = new Date(2024, 0, 1, 0, 0, 0, 0);
    const end = new Date(2024, 0, 1, 0, 0, 0, 999);

    const customPeriod = createPeriod(start, end);

    expect(customPeriod.date.getMilliseconds()).toBe(499);
  });
});
