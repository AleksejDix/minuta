import { describe, expect, it } from "vitest";
import { contains } from "./contains";
import { getUnitsTestCases } from "#src/test/shared-adapter-tests";
import { periodWith } from "./period";

const ONE_MS = 1;

function msAfter(date: Readonly<Date>): Date {
  return new Date(date.getTime() + ONE_MS);
}

function msBefore(date: Readonly<Date>): Date {
  return new Date(date.getTime() - ONE_MS);
}

const unitsCases = getUnitsTestCases();

describe.each(unitsCases)(
  "contains() basic containment with %s adapter",
  (_name, units) => {
    it("should detect when a period contains a date", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const month = periodWith(units, new Date("2024-01-01T00:00"), "month");

      expect(contains(month, new Date("2024-01-15T00:00"))).toBe(true);
      expect(contains(month, new Date("2024-01-01T00:00"))).toBe(true);
      expect(contains(month, new Date("2024-01-31T23:59:59"))).toBe(true);
      expect(contains(month, new Date("2024-02-01T00:00"))).toBe(false);
      expect(contains(month, new Date("2023-12-31T00:00"))).toBe(false);
    });

    it(
      "should detect when a period contains another period",
      { timeout: 5000 },
      () => {
        expect.hasAssertions();
        const year = periodWith(units, new Date("2024-06-15T00:00"), "year");
        const month = periodWith(units, new Date("2024-06-15T00:00"), "month");
        const day = periodWith(units, new Date("2024-06-15T00:00"), "day");

        expect(contains(year, month)).toBe(true);
        expect(contains(year, day)).toBe(true);
        expect(contains(month, day)).toBe(true);
        expect(contains(day, month)).toBe(false);
        expect(contains(month, year)).toBe(false);
      }
    );
  }
);

describe.each(unitsCases)(
  "contains() boundary containment with %s adapter",
  (_name, units) => {
    it("should handle cross-year boundaries", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const december = periodWith(units, new Date("2023-12-15T00:00"), "month");
      const january = periodWith(units, new Date("2024-01-15T00:00"), "month");

      expect(contains(december, new Date("2023-12-31T00:00"))).toBe(true);
      expect(contains(december, new Date("2024-01-01T00:00"))).toBe(false);
      expect(contains(january, new Date("2023-12-31T00:00"))).toBe(false);
      expect(contains(january, new Date("2024-01-01T00:00"))).toBe(true);
    });

    it("should handle week containment", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const week = periodWith(units, new Date("2024-01-15T00:00"), "week");
      const weekStart = units.week.startOf(new Date("2024-01-15T00:00"));
      const weekEnd = units.week.endOf(new Date("2024-01-15T00:00"));

      expect(contains(week, weekStart)).toBe(true);
      expect(contains(week, weekEnd)).toBe(true);
      expect(contains(week, msAfter(weekEnd))).toBe(false);
    });

    it("should handle exact boundary matches", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const day = periodWith(units, new Date("2024-01-15T00:00"), "day");
      const dayStart = units.day.startOf(new Date("2024-01-15T00:00"));
      const dayEnd = units.day.endOf(new Date("2024-01-15T00:00"));

      expect(contains(day, dayStart)).toBe(true);
      expect(contains(day, dayEnd)).toBe(true);
      expect(contains(day, msBefore(dayStart))).toBe(false);
      expect(contains(day, msAfter(dayEnd))).toBe(false);
    });
  }
);

describe.each(unitsCases)(
  "contains() partial containment with %s adapter",
  (_name, units) => {
    it("should handle partial period overlap", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const period1 = {
        end: new Date("2024-01-20T00:00"),
        start: new Date("2024-01-10T00:00"),
        unit: "custom" as const,
      };

      const period2 = {
        end: new Date("2024-01-25T00:00"),
        start: new Date("2024-01-15T00:00"),
        unit: "custom" as const,
      };

      // Period1 does not fully contain period2
      expect(contains(period1, period2)).toBe(false);

      // But it contains part of period2
      expect(contains(period1, new Date("2024-01-15T00:00"))).toBe(true);
      expect(contains(period1, new Date("2024-01-18T00:00"))).toBe(true);
      expect(contains(period1, new Date("2024-01-21T00:00"))).toBe(false);
    });

    it("should handle hour and minute containment", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const hour = periodWith(units, new Date("2024-01-15T14:30"), "hour");

      expect(contains(hour, new Date("2024-01-15T14:00"))).toBe(true);
      expect(contains(hour, new Date("2024-01-15T14:30"))).toBe(true);
      expect(contains(hour, new Date("2024-01-15T14:59:59"))).toBe(true);
      expect(contains(hour, new Date("2024-01-15T15:00"))).toBe(false);
      expect(contains(hour, new Date("2024-01-15T13:59:59"))).toBe(false);
    });
  }
);
