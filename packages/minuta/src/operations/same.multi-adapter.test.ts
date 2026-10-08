import { describe, expect, it } from "vitest";
import type { Period } from "#src/types";
import { getUnitsTestCases } from "#src/test/shared-adapter-tests";
import { periodWith } from "./period";
import { sameWith } from "./same";
import { testDates } from "#src/test/test-dates";

const ONE_DAY_MS = 86_400_000;

const unitsCases = getUnitsTestCases();

describe.each(unitsCases)(
  "sameWith() basics with %s adapter",
  (_name, units) => {
    it("should return true for same year", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const period1 = periodWith(units, testDates.jan1, "year");
      const period2 = periodWith(units, testDates.dec31, "year");

      expect(sameWith(units, period1, period2, "year")).toBe(true);
    });

    it("should return false for different years", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const period1 = periodWith(units, testDates.dec31, "year");
      const period2 = periodWith(units, testDates.year2025, "year");

      expect(sameWith(units, period1, period2, "year")).toBe(false);
    });

    it(
      "should return true for custom periods with same boundaries",
      { timeout: 5000 },
      () => {
        expect.hasAssertions();
        const start = new Date("2024-06-15T14:30:45.123");
        const end = new Date(start.getTime() + ONE_DAY_MS);
        const period1: Period = { end, start, unit: "custom" };
        const period2: Period = { end, start, unit: "custom" };

        expect(sameWith(units, period1, period2, "custom")).toBe(true);
      }
    );

    it("should handle month comparison correctly", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const period1 = periodWith(units, testDates.jun1, "month");
      const period2 = periodWith(units, testDates.jun30, "month");

      expect(sameWith(units, period1, period2, "month")).toBe(true);
    });
  }
);

describe.each(unitsCases)(
  "sameWith() weeks and days with %s adapter",
  (_name, units) => {
    it("days in the same week → true", { timeout: 5000 }, () => {
      expect.hasAssertions();
      // Jan 10 2024 = Wednesday, Jan 12 2024 = Friday → same week
      const day1 = periodWith(units, new Date("2024-01-10T00:00:00"), "day");
      const day2 = periodWith(units, new Date("2024-01-12T00:00:00"), "day");
      expect(sameWith(units, day1, day2, "week")).toBe(true);
    });

    it("days in different weeks → false", { timeout: 5000 }, () => {
      expect.hasAssertions();
      // Jan 10 2024 (Wed) vs Jan 15 2024 (Mon next week)
      const day1 = periodWith(units, new Date("2024-01-10T00:00:00"), "day");
      const day2 = periodWith(units, testDates.jan15, "day");
      expect(sameWith(units, day1, day2, "week")).toBe(false);
    });

    it("hours in the same day → true", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const hour1 = periodWith(units, new Date("2024-06-15T09:00:00"), "hour");
      const hour2 = periodWith(units, new Date("2024-06-15T17:00:00"), "hour");
      expect(sameWith(units, hour1, hour2, "day")).toBe(true);
    });

    it("hours in different days → false", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const hour1 = periodWith(units, new Date("2024-06-15T23:00:00"), "hour");
      const hour2 = periodWith(units, new Date("2024-06-16T00:00:00"), "hour");
      expect(sameWith(units, hour1, hour2, "day")).toBe(false);
    });
  }
);

describe.each(unitsCases)(
  "sameWith() months and quarters with %s adapter",
  (_name, units) => {
    it("month and week in the same quarter → true", { timeout: 5000 }, () => {
      expect.hasAssertions();
      // June (Q2) and a week in May (Q2)
      const monthPeriod = periodWith(units, testDates.jun1, "month");
      const weekPeriod = periodWith(units, testDates.may15, "week");
      expect(sameWith(units, monthPeriod, weekPeriod, "quarter")).toBe(true);
    });

    it(
      "month and week in different quarters → false",
      { timeout: 5000 },
      () => {
        expect.hasAssertions();
        // June (Q2) and a week in November (Q4)
        const monthPeriod = periodWith(units, testDates.jun1, "month");
        const weekPeriod = periodWith(units, testDates.nov15, "week");
        expect(sameWith(units, monthPeriod, weekPeriod, "quarter")).toBe(false);
      }
    );

    it("days in the same month → true", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const day1 = periodWith(units, testDates.jun1, "day");
      const day2 = periodWith(units, testDates.jun30, "day");
      expect(sameWith(units, day1, day2, "month")).toBe(true);
    });

    it("days in different months → false", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const day1 = periodWith(units, testDates.jun30, "day");
      const day2 = periodWith(units, new Date("2024-07-01T00:00:00"), "day");
      expect(sameWith(units, day1, day2, "month")).toBe(false);
    });
  }
);

describe.each(unitsCases)(
  "sameWith() custom periods with %s adapter",
  (_name, units) => {
    it("same start and end → true", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const start = new Date("2024-06-15T00:00:00");
      const end = new Date("2024-06-20T00:00:00");
      const first: Period = { end, start, unit: "custom" };
      const second: Period = { end, start, unit: "custom" };
      expect(sameWith(units, first, second, "custom")).toBe(true);
    });

    it("same start, different end → false", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const start = new Date("2024-06-15T00:00:00");
      const first: Period = {
        end: new Date("2024-06-20T00:00:00"),
        start,
        unit: "custom",
      };
      const second: Period = {
        end: new Date("2024-06-25T00:00:00"),
        start,
        unit: "custom",
      };
      expect(sameWith(units, first, second, "custom")).toBe(false);
    });

    it("different start, same end → false", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const end = new Date("2024-06-20T00:00:00");
      const first: Period = {
        end,
        start: new Date("2024-06-15T00:00:00"),
        unit: "custom",
      };
      const second: Period = {
        end,
        start: new Date("2024-06-16T00:00:00"),
        unit: "custom",
      };
      expect(sameWith(units, first, second, "custom")).toBe(false);
    });
  }
);
