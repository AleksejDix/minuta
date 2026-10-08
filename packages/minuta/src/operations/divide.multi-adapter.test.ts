import { describe, expect, it } from "vitest";
import type { ReadonlyPeriod } from "#src/types";
import { divide } from "./divide";
import { getAdapterTestCases } from "#src/test/shared-adapter-tests";
import { derivePeriod as period } from "./period";

const JANUARY = 0;
const FEBRUARY = 1;
const DECEMBER = 11;
const MONTHS_PER_YEAR = 12;
const DAYS_IN_LEAP_FEBRUARY = 29;
const DAYS_PER_WEEK = 7;
const HOURS_PER_DAY = 24;
const DST_SHORT_DAY_HOURS = 23;
const LAST_HOUR = 23;
const MINUTES_PER_HOUR = 60;
const SECONDS_PER_MINUTE = 60;
const LAST_MINUTE = 59;
const LAST_SECOND = 59;
const FIRST_DAY = 1;
const MIDNIGHT = 0;
const ZERO = 0;
const DAY_15 = 15;
const HOUR_14 = 14;
const MINUTE_30 = 30;
const YEAR_2023 = 2023;
const YEAR_2024 = 2024;

function required(slot: ReadonlyPeriod | undefined): ReadonlyPeriod {
  if (slot === undefined) {
    throw new Error("Expected a period");
  }
  return slot;
}

function adjacentPairs(
  list: readonly ReadonlyPeriod[]
): (readonly [ReadonlyPeriod, ReadonlyPeriod])[] {
  return list
    .slice(FIRST_DAY)
    .map((current, index) => [required(list[index]), current] as const);
}

function expectedNextDate(
  previous: ReadonlyPeriod,
  current: ReadonlyPeriod
): number {
  // Handle month boundary
  if (current.start.getMonth() === previous.start.getMonth()) {
    return previous.start.getDate() + FIRST_DAY;
  }
  return FIRST_DAY;
}

const adapters = getAdapterTestCases();

describe.each(adapters)(
  "divide() calendar division with %s adapter",
  (_name, adapter) => {
    it("should divide year into months", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const year = period(adapter, new Date("2024-06-15T00:00"), "year");
      const months = divide(adapter, year, "month");
      const [january] = months;

      expect(months).toHaveLength(MONTHS_PER_YEAR);
      expect(required(january).type).toBe("month");
      // January
      expect(required(january).start.getMonth()).toBe(JANUARY);
      // December
      expect(required(months.at(DECEMBER)).start.getMonth()).toBe(DECEMBER);

      // Check continuity
      for (const [previous, current] of adjacentPairs(months)) {
        expect(current.start.getTime()).toBeGreaterThan(previous.end.getTime());
      }
    });

    it("should divide month into days", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const february2024 = period(
        adapter,
        new Date("2024-02-15T00:00"),
        "month"
      );
      const days = divide(adapter, february2024, "day");
      const [first] = days;

      // Leap year
      expect(days).toHaveLength(DAYS_IN_LEAP_FEBRUARY);
      expect(required(first).start.getDate()).toBe(FIRST_DAY);
      expect(required(days.at(-FIRST_DAY)).start.getDate()).toBe(
        DAYS_IN_LEAP_FEBRUARY
      );

      // All days should be in February
      for (const day of days) {
        expect(day.start.getMonth()).toBe(FEBRUARY);
        expect(day.type).toBe("day");
      }
    });
  }
);

describe.each(adapters)(
  "divide() week division with %s adapter",
  (_name, adapter) => {
    it("should divide week into days", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const week = period(adapter, new Date("2024-01-15T00:00"), "week");
      const days = divide(adapter, week, "day");

      expect(days).toHaveLength(DAYS_PER_WEEK);

      // Check days are consecutive
      for (const [previous, current] of adjacentPairs(days)) {
        expect(current.start.getDate()).toBe(
          expectedNextDate(previous, current)
        );
      }
    });

    it("should divide day into hours", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const day = period(adapter, new Date("2024-01-15T00:00"), "day");
      const hours = divide(adapter, day, "hour");
      const [first] = hours;

      expect(hours).toHaveLength(HOURS_PER_DAY);
      expect(required(first).start.getHours()).toBe(MIDNIGHT);
      expect(required(hours.at(-FIRST_DAY)).start.getHours()).toBe(LAST_HOUR);

      // All hours should be on the same day
      for (const hour of hours) {
        expect(hour.start.getDate()).toBe(DAY_15);
        expect(hour.type).toBe("hour");
      }
    });
  }
);

describe.each(adapters)(
  "divide() time division with %s adapter",
  (_name, adapter) => {
    it("should divide hour into minutes", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const hour = period(adapter, new Date("2024-01-15T14:00"), "hour");
      const minutes = divide(adapter, hour, "minute");
      const [first] = minutes;

      expect(minutes).toHaveLength(MINUTES_PER_HOUR);
      expect(required(first).start.getMinutes()).toBe(ZERO);
      expect(required(minutes.at(-FIRST_DAY)).start.getMinutes()).toBe(
        LAST_MINUTE
      );

      // All minutes should be in the same hour
      for (const minute of minutes) {
        expect(minute.start.getHours()).toBe(HOUR_14);
        expect(minute.type).toBe("minute");
      }
    });

    it("should divide minute into seconds", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const minute = period(adapter, new Date("2024-01-15T14:30"), "minute");
      const seconds = divide(adapter, minute, "second");
      const [first] = seconds;

      expect(seconds).toHaveLength(SECONDS_PER_MINUTE);
      expect(required(first).start.getSeconds()).toBe(ZERO);
      expect(required(seconds.at(-FIRST_DAY)).start.getSeconds()).toBe(
        LAST_SECOND
      );

      // All seconds should be in the same minute
      for (const second of seconds) {
        expect(second.start.getMinutes()).toBe(MINUTE_30);
        expect(second.type).toBe("second");
      }
    });
  }
);

describe.each(adapters)(
  "divide() boundary division with %s adapter",
  (_name, adapter) => {
    it(
      "should handle month boundaries when dividing",
      { timeout: 5000 },
      () => {
        expect.hasAssertions();
        // Create a week that spans month boundary
        const lastWeekOfJan = period(
          adapter,
          new Date("2024-01-29T00:00"),
          "week"
        );
        const days = divide(adapter, lastWeekOfJan, "day");

        const januaryDays = days.filter(
          (day: ReadonlyPeriod) => day.start.getMonth() === JANUARY
        );
        const februaryDays = days.filter(
          (day: ReadonlyPeriod) => day.start.getMonth() === FEBRUARY
        );

        expect(januaryDays.length + februaryDays.length).toBe(DAYS_PER_WEEK);
        expect(januaryDays.length).toBeGreaterThan(ZERO);
        expect(februaryDays.length).toBeGreaterThan(ZERO);
      }
    );

    it("should handle year boundaries when dividing", { timeout: 5000 }, () => {
      expect.hasAssertions();
      // Create a week that spans year boundary
      const lastWeekOf2023 = period(
        adapter,
        new Date("2023-12-30T00:00"),
        "week"
      );
      const days = divide(adapter, lastWeekOf2023, "day");

      const days2023 = days.filter(
        (day: ReadonlyPeriod) => day.start.getFullYear() === YEAR_2023
      );
      const days2024 = days.filter(
        (day: ReadonlyPeriod) => day.start.getFullYear() === YEAR_2024
      );

      expect(days2023.length + days2024.length).toBe(DAYS_PER_WEEK);
    });
  }
);

describe.each(adapters)(
  "divide() irregular division with %s adapter",
  (_name, adapter) => {
    it(
      "should handle daylight saving time transitions",
      { timeout: 5000 },
      () => {
        expect.hasAssertions();
        // Test spring forward (in US, typically March)
        const marchDay = period(adapter, new Date("2024-03-10T00:00"), "day");
        const hours = divide(adapter, marchDay, "hour");

        // DST spring-forward days have 23 hours in affected timezones, 24 otherwise
        expect(hours.length).toBeGreaterThanOrEqual(DST_SHORT_DAY_HOURS);
        expect(hours.length).toBeLessThanOrEqual(HOURS_PER_DAY);

        // Hours should be continuous regardless of DST
        for (const [previous, current] of adjacentPairs(hours)) {
          expect(current.start.getTime()).toBeGreaterThan(
            previous.start.getTime()
          );
        }
      }
    );

    it("should handle partial periods correctly", { timeout: 5000 }, () => {
      expect.hasAssertions();
      // Create a custom period that doesn't align with standard boundaries
      const customPeriod = {
        end: new Date("2024-01-16T10:45"),
        start: new Date("2024-01-15T14:30"),
        type: "custom" as const,
      };

      const hours = divide(adapter, customPeriod, "hour");
      const [first] = hours;

      // Should include partial hours at boundaries
      expect(hours.length).toBeGreaterThan(ZERO);
      expect(required(first).start.getTime()).toBeGreaterThanOrEqual(
        customPeriod.start.getTime()
      );
      expect(required(hours.at(-FIRST_DAY)).end.getTime()).toBeLessThanOrEqual(
        customPeriod.end.getTime()
      );
    });
  }
);
