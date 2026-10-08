import { describe, expect, it } from "vitest";
import type { Period } from "#src/types";
import { getAdapterTestCases } from "#src/test/shared-adapter-tests";
import { isSame } from "./is-same";
import { derivePeriod as period } from "./period";
import { testDates } from "#src/test/test-dates";

const ONE_DAY_MS = 86_400_000;

const adapters = getAdapterTestCases();

describe.each(adapters)("isSame() basics with %s adapter", (_name, adapter) => {
  it("should return true for same year", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const period1 = period(adapter, testDates.jan1, "year");
    const period2 = period(adapter, testDates.dec31, "year");

    expect(isSame(adapter, period1, period2, "year")).toBe(true);
  });

  it("should return false for different years", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const period1 = period(adapter, testDates.dec31, "year");
    const period2 = period(adapter, testDates.year2025, "year");

    expect(isSame(adapter, period1, period2, "year")).toBe(false);
  });

  it(
    "should return true for custom periods with same boundaries",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const start = new Date("2024-06-15T14:30:45.123");
      const end = new Date(start.getTime() + ONE_DAY_MS);
      const period1: Period = { end, start, type: "custom" };
      const period2: Period = { end, start, type: "custom" };

      expect(isSame(adapter, period1, period2, "custom")).toBe(true);
    }
  );

  it("should handle month comparison correctly", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const period1 = period(adapter, testDates.jun1, "month");
    const period2 = period(adapter, testDates.jun30, "month");

    expect(isSame(adapter, period1, period2, "month")).toBe(true);
  });
});

describe.each(adapters)(
  "isSame() weeks and days with %s adapter",
  (_name, adapter) => {
    it("days in the same week → true", { timeout: 5000 }, () => {
      expect.hasAssertions();
      // Jan 10 2024 = Wednesday, Jan 12 2024 = Friday → same week
      const day1 = period(adapter, new Date("2024-01-10T00:00:00"), "day");
      const day2 = period(adapter, new Date("2024-01-12T00:00:00"), "day");
      expect(isSame(adapter, day1, day2, "week")).toBe(true);
    });

    it("days in different weeks → false", { timeout: 5000 }, () => {
      expect.hasAssertions();
      // Jan 10 2024 (Wed) vs Jan 15 2024 (Mon next week)
      const day1 = period(adapter, new Date("2024-01-10T00:00:00"), "day");
      const day2 = period(adapter, testDates.jan15, "day");
      expect(isSame(adapter, day1, day2, "week")).toBe(false);
    });

    it("hours in the same day → true", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const hour1 = period(adapter, new Date("2024-06-15T09:00:00"), "hour");
      const hour2 = period(adapter, new Date("2024-06-15T17:00:00"), "hour");
      expect(isSame(adapter, hour1, hour2, "day")).toBe(true);
    });

    it("hours in different days → false", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const hour1 = period(adapter, new Date("2024-06-15T23:00:00"), "hour");
      const hour2 = period(adapter, new Date("2024-06-16T00:00:00"), "hour");
      expect(isSame(adapter, hour1, hour2, "day")).toBe(false);
    });
  }
);

describe.each(adapters)(
  "isSame() months and quarters with %s adapter",
  (_name, adapter) => {
    it("month and week in the same quarter → true", { timeout: 5000 }, () => {
      expect.hasAssertions();
      // June (Q2) and a week in May (Q2)
      const monthPeriod = period(adapter, testDates.jun1, "month");
      const weekPeriod = period(adapter, testDates.may15, "week");
      expect(isSame(adapter, monthPeriod, weekPeriod, "quarter")).toBe(true);
    });

    it(
      "month and week in different quarters → false",
      { timeout: 5000 },
      () => {
        expect.hasAssertions();
        // June (Q2) and a week in November (Q4)
        const monthPeriod = period(adapter, testDates.jun1, "month");
        const weekPeriod = period(adapter, testDates.nov15, "week");
        expect(isSame(adapter, monthPeriod, weekPeriod, "quarter")).toBe(false);
      }
    );

    it("days in the same month → true", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const day1 = period(adapter, testDates.jun1, "day");
      const day2 = period(adapter, testDates.jun30, "day");
      expect(isSame(adapter, day1, day2, "month")).toBe(true);
    });

    it("days in different months → false", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const day1 = period(adapter, testDates.jun30, "day");
      const day2 = period(adapter, new Date("2024-07-01T00:00:00"), "day");
      expect(isSame(adapter, day1, day2, "month")).toBe(false);
    });
  }
);

describe.each(adapters)(
  "isSame() custom periods with %s adapter",
  (_name, adapter) => {
    it("same start and end → true", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const start = new Date("2024-06-15T00:00:00");
      const end = new Date("2024-06-20T00:00:00");
      const first: Period = { end, start, type: "custom" };
      const second: Period = { end, start, type: "custom" };
      expect(isSame(adapter, first, second, "custom")).toBe(true);
    });

    it("same start, different end → false", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const start = new Date("2024-06-15T00:00:00");
      const first: Period = {
        end: new Date("2024-06-20T00:00:00"),
        start,
        type: "custom",
      };
      const second: Period = {
        end: new Date("2024-06-25T00:00:00"),
        start,
        type: "custom",
      };
      expect(isSame(adapter, first, second, "custom")).toBe(false);
    });

    it("different start, same end → false", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const end = new Date("2024-06-20T00:00:00");
      const first: Period = {
        end,
        start: new Date("2024-06-15T00:00:00"),
        type: "custom",
      };
      const second: Period = {
        end,
        start: new Date("2024-06-16T00:00:00"),
        type: "custom",
      };
      expect(isSame(adapter, first, second, "custom")).toBe(false);
    });
  }
);
