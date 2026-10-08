import { createPeriod, derivePeriod } from "./period";
import { describe, expect, it } from "vitest";
import { createNativeAdapter } from "#src/adapters/native/index";

const JANUARY = 0;
const FEBRUARY = 1;
const FIRST_DAY = 1;
const NINE_AM = 9;
const FIVE_PM = 17;
const YEAR_2023 = 2023;
const YEAR_2024 = 2024;

const adapter = createNativeAdapter();

describe("derivePeriod()", () => {
  it("should create a month period", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const date = new Date("2024-01-15T00:00:00");
    const monthPeriod = derivePeriod(adapter, date, "month");
    expect(monthPeriod.type).toBe("month");
    expect(monthPeriod.start.getMonth()).toBe(JANUARY);
    expect(monthPeriod.start.getDate()).toBe(FIRST_DAY);
  });

  /*
   * Non-adapter units ("custom", "stableMonth", "stableYear") are prevented
   * by the type system — derivePeriod only accepts AdapterUnit.
   */
});

describe("createPeriod() boundaries", () => {
  it(
    "should create custom period with correct properties",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const start = new Date("2024-01-01T00:00:00");
      const end = new Date("2024-01-14T23:59:59.999");

      const customPeriod = createPeriod(start, end);

      expect(customPeriod.type).toBe("custom");
      expect(customPeriod.start).toStrictEqual(start);
      expect(customPeriod.end).toStrictEqual(end);
    }
  );

  it("should handle same start and end dates", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const date = new Date("2024-01-15T12:00:00");

    const customPeriod = createPeriod(date, date);

    expect(customPeriod.start).toStrictEqual(date);
    expect(customPeriod.end).toStrictEqual(date);
  });

  it("should handle time components", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const start = new Date("2024-01-01T09:00:00");
    const end = new Date("2024-01-01T17:00:00");

    const customPeriod = createPeriod(start, end);

    expect(customPeriod.start.getHours()).toBe(NINE_AM);
    expect(customPeriod.end.getHours()).toBe(FIVE_PM);
  });
});

describe("createPeriod() spanning calendar units", () => {
  it("should handle cross-month periods", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const start = new Date("2024-01-15T00:00:00");
    const end = new Date("2024-02-15T00:00:00");

    const customPeriod = createPeriod(start, end);

    expect(customPeriod.start.getMonth()).toBe(JANUARY);
    expect(customPeriod.end.getMonth()).toBe(FEBRUARY);
  });

  it("should handle cross-year periods", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const start = new Date("2023-12-15T00:00:00");
    const end = new Date("2024-01-15T00:00:00");

    const customPeriod = createPeriod(start, end);

    expect(customPeriod.start.getFullYear()).toBe(YEAR_2023);
    expect(customPeriod.end.getFullYear()).toBe(YEAR_2024);
  });
});
