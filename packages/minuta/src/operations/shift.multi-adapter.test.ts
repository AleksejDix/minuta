import { describe, expect, it } from "vitest";
import type { Unit } from "#src/types";
import { getUnitsTestCases } from "#src/test/shared-adapter-tests";
import { periodWith } from "./period";
import { shiftWith } from "./shift";

const ONE_STEP = 1;
const BACK_ONE = -1;
const BACK_TWO = -2;
const BACK_SIX = -6;
const BACK_TEN = -10;
const TWO_STEPS = 2;
const FOUR_STEPS = 4;
const SEVEN_STEPS = 7;
const FIFTEEN_STEPS = 15;
const THIRTY_ONE_STEPS = 31;
const DAYS_IN_2023 = 365;
const DAYS_IN_2024 = 366;
const NO_STEPS = 0;
const MS_PER_DAY = 86_400_000;
const DAYS_IN_FOUR_WEEKS = 28;

const UNITS: readonly Unit[] = [
  "year",
  "month",
  "week",
  "day",
  "hour",
  "minute",
  "second",
];

type DateParts = Readonly<{
  day: number;
  hours: number;
  month: number;
  year: number;
}>;

function parts(date: Readonly<Date>): DateParts {
  return {
    day: date.getDate(),
    hours: date.getHours(),
    month: date.getMonth(),
    year: date.getFullYear(),
  };
}

const unitsCases = getUnitsTestCases();

describe.each(unitsCases)(
  "shiftWith() navigation directions with %s adapter",
  (_name, units) => {
    it("should navigate forward by positive amounts", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const startDate = new Date("2024-01-15T00:00");
      const day = periodWith(units, startDate, "day");

      const nextWeek = shiftWith(units, day, SEVEN_STEPS);
      expect(nextWeek.unit).toBe("day");
      expect(parts(nextWeek.start)).toMatchObject({ day: 22, month: 0 });

      const nextMonth = shiftWith(units, day, THIRTY_ONE_STEPS);
      // February
      expect(parts(nextMonth.start)).toMatchObject({ day: 15, month: 1 });
    });

    it(
      "should navigate backward by negative amounts",
      { timeout: 5000 },
      () => {
        expect.hasAssertions();
        // June 15
        const startDate = new Date("2024-06-15T00:00");
        const month = periodWith(units, startDate, "month");

        const twoMonthsAgo = shiftWith(units, month, BACK_TWO);
        expect(twoMonthsAgo.unit).toBe("month");
        // April
        expect(parts(twoMonthsAgo.start)).toMatchObject({
          month: 3,
          year: 2024,
        });

        const sixMonthsAgo = shiftWith(units, month, BACK_SIX);
        // December
        expect(parts(sixMonthsAgo.start)).toMatchObject({
          month: 11,
          year: 2023,
        });
      }
    );
  }
);

describe.each(unitsCases)(
  "shiftWith() navigation without offset with %s adapter",
  (_name, units) => {
    it("should handle zero offset", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const date = new Date("2024-01-15T00:00");
      const week = periodWith(units, date, "week");
      const sameWeek = shiftWith(units, week, NO_STEPS);
      expect(sameWeek.unit).toBe("week");
      expect(sameWeek.start.getTime()).toBe(week.start.getTime());
      expect(sameWeek.end.getTime()).toBe(week.end.getTime());
    });
  }
);

describe.each(unitsCases)(
  "shiftWith() navigation by unit with %s adapter",
  (_name, units) => {
    it("should navigate years correctly", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const year = periodWith(units, new Date("2024-06-15T00:00"), "year");

      const nextYear = shiftWith(units, year, ONE_STEP);
      expect(parts(nextYear.start)).toMatchObject({ year: 2025 });
      expect(parts(nextYear.end)).toMatchObject({ year: 2025 });

      const tenYearsAgo = shiftWith(units, year, BACK_TEN);
      expect(parts(tenYearsAgo.start)).toMatchObject({ year: 2014 });
    });

    it("should navigate weeks correctly", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const week = periodWith(units, new Date("2024-01-10T00:00"), "week");

      const fourWeeksLater = shiftWith(units, week, FOUR_STEPS);
      // Should be approximately 28 days later
      const daysDiff = Math.round(
        (fourWeeksLater.start.getTime() - week.start.getTime()) / MS_PER_DAY
      );
      expect(daysDiff).toBe(DAYS_IN_FOUR_WEEKS);
    });

    it("should navigate hours correctly", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const hour = periodWith(units, new Date("2024-01-15T10:00"), "hour");

      const fifteenHoursLater = shiftWith(units, hour, FIFTEEN_STEPS);
      // Next day; 10 + 15 = 25, so 1 AM next day
      expect(parts(fifteenHoursLater.start)).toMatchObject({
        day: 16,
        hours: 1,
      });
    });
  }
);

describe.each(unitsCases)(
  "shiftWith() navigation across boundaries with %s adapter",
  (_name, units) => {
    it("should handle month boundaries correctly", { timeout: 5000 }, () => {
      expect.hasAssertions();
      // Start on January 31
      const day = periodWith(units, new Date("2024-01-31T00:00"), "day");

      const nextDay = shiftWith(units, day, ONE_STEP);
      // February
      expect(parts(nextDay.start)).toMatchObject({ day: 1, month: 1 });

      // Navigate months from January 31
      const month = periodWith(units, new Date("2024-01-31T00:00"), "month");
      const nextMonth = shiftWith(units, month, ONE_STEP);
      // February
      expect(parts(nextMonth.start)).toMatchObject({ month: 1 });
      // Feb 29 (leap year)
      expect(parts(nextMonth.end)).toMatchObject({ day: 29 });
    });

    it("should handle year boundaries correctly", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const december = periodWith(units, new Date("2023-12-15T00:00"), "month");

      const january = shiftWith(units, december, ONE_STEP);
      expect(parts(january.start)).toMatchObject({ month: 0, year: 2024 });

      const november = shiftWith(units, december, BACK_ONE);
      expect(parts(november.start)).toMatchObject({ month: 10, year: 2023 });
    });

    it(
      "should handle daylight saving time transitions",
      { timeout: 5000 },
      () => {
        expect.hasAssertions();
        // Test navigation across DST boundary (spring forward)
        // March 9
        const beforeDST = periodWith(
          units,
          new Date("2024-03-09T00:00"),
          "day"
        );
        // March 11
        const afterDST = shiftWith(units, beforeDST, TWO_STEPS);

        expect(parts(afterDST.start)).toMatchObject({ day: 11 });
        expect(afterDST.unit).toBe("day");
      }
    );
  }
);

describe.each(unitsCases)(
  "shiftWith() navigation types and offsets with %s adapter",
  (_name, units) => {
    it("should preserve period unit", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const date = new Date("2024-06-15T14:30:45");

      for (const unit of UNITS) {
        const start = periodWith(units, date, unit);
        const navigated = shiftWith(units, start, ONE_STEP);
        expect(navigated.unit).toBe(unit);
      }
    });

    it(
      "should handle large offsets within a leap year",
      { timeout: 5000 },
      () => {
        expect.hasAssertions();
        const day = periodWith(units, new Date("2024-01-01T00:00"), "day");

        // 2024 is a leap year (366 days), so 365 days from Jan 1 = Dec 31
        const yearLater = shiftWith(units, day, DAYS_IN_2023);
        expect(parts(yearLater.start)).toMatchObject({
          day: 31,
          month: 11,
          year: 2024,
        });
      }
    );

    it(
      "should handle large offsets past a leap year",
      { timeout: 5000 },
      () => {
        expect.hasAssertions();
        const day = periodWith(units, new Date("2024-01-01T00:00"), "day");

        // 366 days from Jan 1, 2024 = Jan 1, 2025
        const leapYearLater = shiftWith(units, day, DAYS_IN_2024);
        expect(parts(leapYearLater.start)).toMatchObject({
          day: 1,
          month: 0,
          year: 2025,
        });
      }
    );
  }
);
