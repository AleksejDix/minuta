import { describe, expect, it } from "vitest";
import { periodWith, range } from "./period";
import { nativeUnits } from "#src/adapters/native/index";

const JANUARY = 0;
const FEBRUARY = 1;
const FIRST_DAY = 1;
const NINE_AM = 9;
const FIVE_PM = 17;
const YEAR_2023 = 2023;
const YEAR_2024 = 2024;

const units = nativeUnits();

describe("periodWith()", () => {
  it("should create a month period", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const date = new Date("2024-01-15T00:00:00");
    const monthPeriod = periodWith(units, date, "month");
    expect(monthPeriod.unit).toBe("month");
    expect(monthPeriod.start.getMonth()).toBe(JANUARY);
    expect(monthPeriod.start.getDate()).toBe(FIRST_DAY);
  });

  /*
   * Non-unit values such as "custom" are prevented
   * by the type system — periodWith only accepts Unit.
   */
});

describe("range() boundaries", () => {
  it(
    "should create custom period with correct properties",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const start = new Date("2024-01-01T00:00:00");
      const end = new Date("2024-01-14T23:59:59.999");

      const customPeriod = range(start, end);

      expect(customPeriod.unit).toBe("custom");
      expect(customPeriod.start).toStrictEqual(start);
      expect(customPeriod.end).toStrictEqual(end);
    }
  );

  it("should handle same start and end dates", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const date = new Date("2024-01-15T12:00:00");

    const customPeriod = range(date, date);

    expect(customPeriod.start).toStrictEqual(date);
    expect(customPeriod.end).toStrictEqual(date);
  });

  it("should handle time components", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const start = new Date("2024-01-01T09:00:00");
    const end = new Date("2024-01-01T17:00:00");

    const customPeriod = range(start, end);

    expect(customPeriod.start.getHours()).toBe(NINE_AM);
    expect(customPeriod.end.getHours()).toBe(FIVE_PM);
  });
});

describe("range() spanning calendar units", () => {
  it("should handle cross-month periods", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const start = new Date("2024-01-15T00:00:00");
    const end = new Date("2024-02-15T00:00:00");

    const customPeriod = range(start, end);

    expect(customPeriod.start.getMonth()).toBe(JANUARY);
    expect(customPeriod.end.getMonth()).toBe(FEBRUARY);
  });

  it("should handle cross-year periods", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const start = new Date("2023-12-15T00:00:00");
    const end = new Date("2024-01-15T00:00:00");

    const customPeriod = range(start, end);

    expect(customPeriod.start.getFullYear()).toBe(YEAR_2023);
    expect(customPeriod.end.getFullYear()).toBe(YEAR_2024);
  });
});
