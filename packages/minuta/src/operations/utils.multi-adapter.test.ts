import { describe, expect, it } from "vitest";
import { isWeekdayWith, isWeekendWith } from "./index";
import { getUnitsTestCases } from "#src/test/shared-adapter-tests";
import { periodWith as period } from "./period";

const WEEKDAY_DATES: readonly Date[] = [
  // Monday
  new Date("2024-01-15T00:00"),
  new Date("2024-01-16T00:00"),
  new Date("2024-01-17T00:00"),
  new Date("2024-01-18T00:00"),
  new Date("2024-01-19T00:00"),
];

const WEEKEND_DATES: readonly Date[] = [
  // Saturday
  new Date("2024-01-20T00:00"),
  // Sunday
  new Date("2024-01-21T00:00"),
];

const adapters = getUnitsTestCases();

describe.each(adapters)("isWeekdayWith() with %s adapter", (_name, units) => {
  it("should return true for Monday through Friday", { timeout: 5000 }, () => {
    expect.hasAssertions();
    for (const date of WEEKDAY_DATES) {
      expect(isWeekdayWith(units, period(units, date, "day"))).toBe(true);
    }
  });

  it("should return false for Saturday and Sunday", { timeout: 5000 }, () => {
    expect.hasAssertions();
    for (const date of WEEKEND_DATES) {
      expect(isWeekdayWith(units, period(units, date, "day"))).toBe(false);
    }
  });

  it("should handle periods correctly", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const mondayPeriod = period(units, new Date("2024-01-15T00:00"), "day");
    const saturdayPeriod = period(units, new Date("2024-01-20T00:00"), "day");

    expect(isWeekdayWith(units, mondayPeriod)).toBe(true);
    expect(isWeekdayWith(units, saturdayPeriod)).toBe(false);
  });

  it("should handle non-day periods", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const weekPeriod = period(units, new Date("2024-01-15T00:00"), "week");
    const monthPeriod = period(units, new Date("2024-01-15T00:00"), "month");

    // Week and month span both weekdays and weekends — neither is fully a weekday
    expect(isWeekdayWith(units, weekPeriod)).toBe(false);
    expect(isWeekdayWith(units, monthPeriod)).toBe(false);
  });
});

describe.each(adapters)("isWeekendWith() with %s adapter", (_name, units) => {
  it("should return true for Saturday and Sunday", { timeout: 5000 }, () => {
    expect.hasAssertions();
    for (const date of WEEKEND_DATES) {
      expect(isWeekendWith(units, period(units, date, "day"))).toBe(true);
    }
  });

  it("should return false for Monday through Friday", { timeout: 5000 }, () => {
    expect.hasAssertions();
    for (const date of WEEKDAY_DATES) {
      expect(isWeekendWith(units, period(units, date, "day"))).toBe(false);
    }
  });

  it("should handle periods correctly", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const saturdayPeriod = period(units, new Date("2024-01-20T00:00"), "day");
    const mondayPeriod = period(units, new Date("2024-01-15T00:00"), "day");

    expect(isWeekendWith(units, saturdayPeriod)).toBe(true);
    expect(isWeekendWith(units, mondayPeriod)).toBe(false);
  });
});

describe.each(adapters)("utils consistency with %s adapter", (_name, units) => {
  it("should be opposite of isWeekday", { timeout: 5000 }, () => {
    expect.hasAssertions();
    for (const date of [...WEEKDAY_DATES, ...WEEKEND_DATES]) {
      const dayPeriod = period(units, date, "day");
      expect(isWeekdayWith(units, dayPeriod)).toBe(
        !isWeekendWith(units, dayPeriod)
      );
    }
  });
});

describe.each(adapters)("utils edge cases with %s adapter", (_name, units) => {
  it("should handle different times on the same day", { timeout: 5000 }, () => {
    expect.hasAssertions();
    // Saturday morning
    const morningPeriod = period(units, new Date("2024-01-20T06:00"), "day");
    // Saturday evening
    const eveningPeriod = period(units, new Date("2024-01-20T20:00"), "day");

    expect(isWeekendWith(units, morningPeriod)).toBe(true);
    expect(isWeekendWith(units, eveningPeriod)).toBe(true);
    expect(isWeekdayWith(units, morningPeriod)).toBe(false);
    expect(isWeekdayWith(units, eveningPeriod)).toBe(false);
  });

  it("should work with different period types", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const saturdayHour = period(units, new Date("2024-01-20T14:00"), "hour");
    const mondayMinute = period(units, new Date("2024-01-15T14:30"), "minute");

    expect(isWeekendWith(units, saturdayHour)).toBe(true);
    expect(isWeekdayWith(units, mondayMinute)).toBe(true);
  });
});
