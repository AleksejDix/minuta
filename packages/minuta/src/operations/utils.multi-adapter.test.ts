import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isTodayWith, isWeekday, isWeekend } from "./index";
import { getUnitsTestCases } from "#src/test/shared-adapter-tests";
import { periodWith as period } from "./period";

const NOW = new Date("2024-01-15T10:30");

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

describe.each(adapters)(
  "isTodayWith() for single days with %s adapter",
  (_name, units) => {
    beforeEach(() => {
      // Mock current date to a known value
      vi.useFakeTimers();
      // Monday, January 15, 2024
      vi.setSystemTime(new Date("2024-01-15T10:30"));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should return true for today's date", { timeout: 5000 }, () => {
      expect.hasAssertions();
      // Different time, same day
      const today = new Date("2024-01-15T14:45");
      const todayPeriod = period(units, today, "day");
      expect(isTodayWith(units, NOW, todayPeriod)).toBe(true);
    });

    it("should return false for yesterday", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const yesterday = new Date("2024-01-14T00:00");
      const yesterdayPeriod = period(units, yesterday, "day");
      expect(isTodayWith(units, NOW, yesterdayPeriod)).toBe(false);
    });

    it("should return false for tomorrow", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const tomorrow = new Date("2024-01-16T00:00");
      const tomorrowPeriod = period(units, tomorrow, "day");
      expect(isTodayWith(units, NOW, tomorrowPeriod)).toBe(false);
    });
  }
);

describe.each(adapters)(
  "isTodayWith() for day periods with %s adapter",
  (_name, units) => {
    beforeEach(() => {
      // Mock current date to a known value
      vi.useFakeTimers();
      // Monday, January 15, 2024
      vi.setSystemTime(new Date("2024-01-15T10:30"));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should return true for today period", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const todayPeriod = period(units, new Date("2024-01-15T00:00"), "day");
      expect(isTodayWith(units, NOW, todayPeriod)).toBe(true);
    });

    it("should return false for yesterday period", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const yesterdayPeriod = period(
        units,
        new Date("2024-01-14T00:00"),
        "day"
      );
      expect(isTodayWith(units, NOW, yesterdayPeriod)).toBe(false);
    });

    it("should handle edge of day correctly", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const startOfDay = new Date("2024-01-15T00:00");
      const endOfDay = new Date("2024-01-15T23:59:59.999");

      const startOfDayPeriod = period(units, startOfDay, "day");
      const endOfDayPeriod = period(units, endOfDay, "day");
      expect(isTodayWith(units, NOW, startOfDayPeriod)).toBe(true);
      expect(isTodayWith(units, NOW, endOfDayPeriod)).toBe(true);
    });
  }
);

describe.each(adapters)(
  "isTodayWith() for longer periods with %s adapter",
  (_name, units) => {
    beforeEach(() => {
      // Mock current date to a known value
      vi.useFakeTimers();
      // Monday, January 15, 2024
      vi.setSystemTime(new Date("2024-01-15T10:30"));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should handle periods that contain today", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const weekPeriod = period(units, new Date("2024-01-15T00:00"), "week");
      const monthPeriod = period(units, new Date("2024-01-15T00:00"), "month");
      const yearPeriod = period(units, new Date("2024-01-15T00:00"), "year");

      // These periods contain today but aren't "today" periods
      expect(isTodayWith(units, NOW, weekPeriod)).toBe(false);
      expect(isTodayWith(units, NOW, monthPeriod)).toBe(false);
      expect(isTodayWith(units, NOW, yearPeriod)).toBe(false);
    });
  }
);

describe.each(adapters)("isWeekday() with %s adapter", (_name, units) => {
  it("should return true for Monday through Friday", { timeout: 5000 }, () => {
    expect.hasAssertions();
    for (const date of WEEKDAY_DATES) {
      expect(isWeekday(period(units, date, "day"))).toBe(true);
    }
  });

  it("should return false for Saturday and Sunday", { timeout: 5000 }, () => {
    expect.hasAssertions();
    for (const date of WEEKEND_DATES) {
      expect(isWeekday(period(units, date, "day"))).toBe(false);
    }
  });

  it("should handle periods correctly", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const mondayPeriod = period(units, new Date("2024-01-15T00:00"), "day");
    const saturdayPeriod = period(units, new Date("2024-01-20T00:00"), "day");

    expect(isWeekday(mondayPeriod)).toBe(true);
    expect(isWeekday(saturdayPeriod)).toBe(false);
  });

  it("should handle non-day periods", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const weekPeriod = period(units, new Date("2024-01-15T00:00"), "week");
    const monthPeriod = period(units, new Date("2024-01-15T00:00"), "month");

    // Week and month span both weekdays and weekends — neither is fully a weekday
    expect(isWeekday(weekPeriod)).toBe(false);
    expect(isWeekday(monthPeriod)).toBe(false);
  });
});

describe.each(adapters)("isWeekend() with %s adapter", (_name, units) => {
  it("should return true for Saturday and Sunday", { timeout: 5000 }, () => {
    expect.hasAssertions();
    for (const date of WEEKEND_DATES) {
      expect(isWeekend(period(units, date, "day"))).toBe(true);
    }
  });

  it("should return false for Monday through Friday", { timeout: 5000 }, () => {
    expect.hasAssertions();
    for (const date of WEEKDAY_DATES) {
      expect(isWeekend(period(units, date, "day"))).toBe(false);
    }
  });

  it("should handle periods correctly", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const saturdayPeriod = period(units, new Date("2024-01-20T00:00"), "day");
    const mondayPeriod = period(units, new Date("2024-01-15T00:00"), "day");

    expect(isWeekend(saturdayPeriod)).toBe(true);
    expect(isWeekend(mondayPeriod)).toBe(false);
  });
});

describe.each(adapters)("utils consistency with %s adapter", (_name, units) => {
  it("should be opposite of isWeekday", { timeout: 5000 }, () => {
    expect.hasAssertions();
    for (const date of [...WEEKDAY_DATES, ...WEEKEND_DATES]) {
      const dayPeriod = period(units, date, "day");
      expect(isWeekday(dayPeriod)).toBe(!isWeekend(dayPeriod));
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

    expect(isWeekend(morningPeriod)).toBe(true);
    expect(isWeekend(eveningPeriod)).toBe(true);
    expect(isWeekday(morningPeriod)).toBe(false);
    expect(isWeekday(eveningPeriod)).toBe(false);
  });

  it("should work with different period types", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const saturdayHour = period(units, new Date("2024-01-20T14:00"), "hour");
    const mondayMinute = period(units, new Date("2024-01-15T14:30"), "minute");

    expect(isWeekend(saturdayHour)).toBe(true);
    expect(isWeekday(mondayMinute)).toBe(true);
  });
});
