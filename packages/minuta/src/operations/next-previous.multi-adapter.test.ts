import { describe, expect, it } from "vitest";
import { nextWith as nextOf, previousWith as previous } from "./shift";
import { getUnitsTestCases } from "#src/test/shared-adapter-tests";
import { periodWith as period } from "./period";

const ONE_MS = 1;
const DAYS_PER_WEEK = 7;
const MS_PER_DAY = 86_400_000;
const NAVIGABLE_UNITS = [
  "year",
  "month",
  "week",
  "day",
  "hour",
  "minute",
  "second",
] as const;

const adapters = getUnitsTestCases();

describe.each(adapters)("next() by unit with %s adapter", (_name, units) => {
  it("should get next day", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const day = period(units, new Date("2024-01-15T00:00:00"), "day");
    const nextDay = nextOf(units, day);

    expect(nextDay.unit).toBe("day");
    expect(nextDay.start).toStrictEqual(new Date("2024-01-16T00:00:00"));
  });

  it("should get next month", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const month = period(units, new Date("2024-01-15T00:00:00"), "month");
    const nextMonth = nextOf(units, month);

    expect(nextMonth.unit).toBe("month");
    // February
    expect(nextMonth.start).toStrictEqual(new Date("2024-02-01T00:00:00"));
  });

  it("should get next year", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const year = period(units, new Date("2024-06-15T00:00:00"), "year");
    const nextYear = nextOf(units, year);

    expect(nextYear.unit).toBe("year");
    expect(nextYear.start).toStrictEqual(new Date("2025-01-01T00:00:00"));
  });

  it("should get next hour", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const hour = period(units, new Date("2024-01-15T14:00:00"), "hour");
    const nextHour = nextOf(units, hour);

    expect(nextHour.unit).toBe("hour");
    expect(nextHour.start).toStrictEqual(new Date("2024-01-15T15:00:00"));
  });
});

describe.each(adapters)(
  "next() across boundaries with %s adapter",
  (_name, units) => {
    it("should handle month boundaries", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const lastDayOfMonth = period(
        units,
        new Date("2024-01-31T00:00:00"),
        "day"
      );
      const nextDay = nextOf(units, lastDayOfMonth);

      // February
      expect(nextDay.start).toStrictEqual(new Date("2024-02-01T00:00:00"));
    });

    it("should handle year boundaries", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const december = period(units, new Date("2023-12-15T00:00:00"), "month");
      const january = nextOf(units, december);

      expect(january.start).toStrictEqual(new Date("2024-01-01T00:00:00"));
    });

    it("should handle day boundary for hours", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const lastHour = period(units, new Date("2024-01-15T23:00:00"), "hour");
      const nextHour = nextOf(units, lastHour);

      expect(nextHour.start).toStrictEqual(new Date("2024-01-16T00:00:00"));
    });
  }
);

describe.each(adapters)(
  "previous() by unit with %s adapter",
  (_name, units) => {
    it("should get previous day", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const day = period(units, new Date("2024-01-15T00:00:00"), "day");
      const prevDay = previous(units, day);

      expect(prevDay.unit).toBe("day");
      expect(prevDay.start).toStrictEqual(new Date("2024-01-14T00:00:00"));
    });

    it("should get previous month", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const month = period(units, new Date("2024-02-15T00:00:00"), "month");
      const prevMonth = previous(units, month);

      expect(prevMonth.unit).toBe("month");
      // January
      expect(prevMonth.start).toStrictEqual(new Date("2024-01-01T00:00:00"));
    });

    it("should get previous year", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const year = period(units, new Date("2024-06-15T00:00:00"), "year");
      const prevYear = previous(units, year);

      expect(prevYear.unit).toBe("year");
      expect(prevYear.start).toStrictEqual(new Date("2023-01-01T00:00:00"));
    });

    it("should get previous minute", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const minute = period(units, new Date("2024-01-15T14:30:00"), "minute");
      const prevMinute = previous(units, minute);

      expect(prevMinute.unit).toBe("minute");
      expect(prevMinute.start).toStrictEqual(new Date("2024-01-15T14:29:00"));
    });
  }
);

describe.each(adapters)(
  "previous() across boundaries with %s adapter",
  (_name, units) => {
    it("should handle month boundaries", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const firstDayOfMonth = period(
        units,
        new Date("2024-02-01T00:00:00"),
        "day"
      );
      const prevDay = previous(units, firstDayOfMonth);

      // January
      expect(prevDay.start).toStrictEqual(new Date("2024-01-31T00:00:00"));
    });

    it("should handle year boundaries", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const january = period(units, new Date("2024-01-15T00:00:00"), "month");
      const december = previous(units, january);

      expect(december.start).toStrictEqual(new Date("2023-12-01T00:00:00"));
    });

    it("should handle hour boundary for minutes", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const firstMinute = period(
        units,
        new Date("2024-01-15T14:00:00"),
        "minute"
      );
      const prevMinute = previous(units, firstMinute);

      expect(prevMinute.start).toStrictEqual(new Date("2024-01-15T13:59:00"));
    });
  }
);

describe.each(adapters)(
  "next()/previous() consistency with %s adapter",
  (_name, units) => {
    it.each(NAVIGABLE_UNITS)(
      "should be reversible operations for %s",
      { timeout: 5000 },
      (unit) => {
        expect.hasAssertions();
        const original = period(units, new Date("2024-06-15T14:30:45"), unit);
        const backToPeriod = previous(units, nextOf(units, original));

        expect(backToPeriod.unit).toBe(original.unit);
        expect(backToPeriod.start.getTime()).toBe(original.start.getTime());
        expect(backToPeriod.end.getTime()).toBe(original.end.getTime());
      }
    );

    it("should maintain period continuity", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const day = period(units, new Date("2024-01-15T00:00:00"), "day");
      const nextDay = nextOf(units, day);

      // End of current day should be just before start of next day
      const msBetween = nextDay.start.getTime() - day.end.getTime();
      expect(msBetween).toBe(ONE_MS);
    });

    it("should handle week navigation correctly", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const week = period(units, new Date("2024-01-15T00:00:00"), "week");
      const nextWeek = nextOf(units, week);
      const prevWeek = previous(units, week);

      // Weeks should be exactly 7 days apart
      const nextDiff =
        (nextWeek.start.getTime() - week.start.getTime()) / MS_PER_DAY;
      const prevDiff =
        (week.start.getTime() - prevWeek.start.getTime()) / MS_PER_DAY;

      expect(nextDiff).toBe(DAYS_PER_WEEK);
      expect(prevDiff).toBe(DAYS_PER_WEEK);
    });
  }
);
