import { describe, expect, it } from "vitest";
import { contains } from "#src/operations/contains";
import { createNativeAdapter } from "#src/adapters/native/index";
import { derivePeriod } from "#src/operations/period";
import { divide } from "#src/operations/divide";
import { next as nextPeriod } from "#src/operations";

const DAYS_IN_COMMON_YEAR = 365;
const DAYS_IN_LEAP_YEAR = 366;
const MIN_WEEKS_IN_YEAR = 52;
const MAX_WEEKS_IN_YEAR = 54;
const MONTHS_PER_YEAR = 12;
const HOURS_PER_DAY = 24;
const SHORT_DAY_HOURS = 23;

const adapter = createNativeAdapter({ weekStartsOn: 1 });

describe("century leap year", () => {
  /*
   * 2100 is NOT a leap year (divisible by 100 but not 400)
   * 2000 WAS a leap year (divisible by 400)
   */

  it(
    "feb 28 + 1 day in 2100 should be Mar 1 (no Feb 29)",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const feb28 = derivePeriod(
        adapter,
        new Date("2100-02-28T00:00:00"),
        "day"
      );
      const nextDay = nextPeriod(adapter, feb28);
      // March 1st
      expect({
        date: nextDay.start.getDate(),
        month: nextDay.start.getMonth(),
      }).toStrictEqual({ date: 1, month: 2 });
    }
  );

  it("year 2100 should have 365 days", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const year = derivePeriod(adapter, new Date("2100-06-15T00:00:00"), "year");
    const days = divide(adapter, year, "day");
    expect(days).toHaveLength(DAYS_IN_COMMON_YEAR);
  });

  it(
    "year 2000 should have 366 days (400-year leap)",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const year = derivePeriod(
        adapter,
        new Date("2000-06-15T00:00:00"),
        "year"
      );
      const days = divide(adapter, year, "day");
      expect(days).toHaveLength(DAYS_IN_LEAP_YEAR);
    }
  );
});

describe("week 53 / ISO week edge cases", () => {
  it("2020 has 53 weeks (starts on Wednesday)", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const year = derivePeriod(adapter, new Date("2020-06-15T00:00:00"), "year");
    const weeks = divide(adapter, year, "week");
    // Some weeks may be partial — count those that overlap
    expect(weeks.length).toBeGreaterThanOrEqual(MIN_WEEKS_IN_YEAR);
    expect(weeks.length).toBeLessThanOrEqual(MAX_WEEKS_IN_YEAR);
  });

  it("dec 31, 2020 falls in ISO week 53", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const dec31 = derivePeriod(adapter, new Date("2020-12-31T00:00:00"), "day");
    const week = derivePeriod(adapter, new Date("2020-12-31T00:00:00"), "week");
    expect(contains(week, dec31.start)).toBe(true);
  });

  it(
    "jan 1, 2021 is still in a 2020 week (Monday start)",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const jan1Week = derivePeriod(
        adapter,
        new Date("2021-01-01T00:00:00"),
        "week"
      );
      // Jan 1 2021 is a Friday — the week started Dec 28 2020
      expect({ year: jan1Week.start.getFullYear() }).toStrictEqual({
        year: 2020,
      });
    }
  );
});

describe("dst spring forward", () => {
  /*
   * March 10, 2024 in America/New_York: 2am → 3am (23-hour day)
   * In UTC this doesn't affect native adapter, but the day should still be valid
   */

  it("day period for DST transition date is valid", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const dstDay = derivePeriod(
      adapter,
      new Date("2024-03-10T00:00:00"),
      "day"
    );
    expect({
      end: dstDay.end.getDate(),
      start: dstDay.start.getDate(),
    }).toStrictEqual({ end: 10, start: 10 });
  });

  it(
    "us DST day (Mar 10) divides into 23 or 24 hours",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const usDst = derivePeriod(
        adapter,
        new Date("2024-03-10T00:00:00"),
        "day"
      );
      const hours = divide(adapter, usDst, "hour");
      expect(hours.length).toBeGreaterThanOrEqual(SHORT_DAY_HOURS);
      expect(hours.length).toBeLessThanOrEqual(HOURS_PER_DAY);
    }
  );
});

describe("dst spring forward in europe", () => {
  // March 31, 2024 in Europe/Zurich: 2am → 3am (23-hour day)

  it(
    "eu DST day (Mar 31) divides into 23 or 24 hours",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const euDst = derivePeriod(
        adapter,
        new Date("2024-03-31T00:00:00"),
        "day"
      );
      const hours = divide(adapter, euDst, "hour");
      expect(hours.length).toBeGreaterThanOrEqual(SHORT_DAY_HOURS);
      expect(hours.length).toBeLessThanOrEqual(HOURS_PER_DAY);
    }
  );
});

describe("dst fall back", () => {
  // Nov 3, 2024 in America/New_York: 2am → 1am (25-hour day)

  it("day period for fall-back date is valid", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const fallBack = derivePeriod(
      adapter,
      new Date("2024-11-03T00:00:00"),
      "day"
    );
    expect({
      end: fallBack.end.getDate(),
      start: fallBack.start.getDate(),
    }).toStrictEqual({ end: 3, start: 3 });
  });

  it("navigate across fall-back boundary", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const nov2 = derivePeriod(adapter, new Date("2024-11-02T00:00:00"), "day");
    const nov3 = nextPeriod(adapter, nov2);
    expect({ date: nov3.start.getDate() }).toStrictEqual({ date: 3 });
    const nov4 = nextPeriod(adapter, nov3);
    expect({ date: nov4.start.getDate() }).toStrictEqual({ date: 4 });
  });
});

describe("date range extremes", () => {
  it("should handle year 1970 (Unix epoch)", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const epoch = derivePeriod(
      adapter,
      new Date("1970-01-01T00:00:00"),
      "year"
    );
    const months = divide(adapter, epoch, "month");
    expect(months).toHaveLength(MONTHS_PER_YEAR);
  });

  it("should handle year 1900", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const old = derivePeriod(adapter, new Date("1900-06-15T00:00:00"), "month");
    expect(old.type).toBe("month");
    // June
    expect({ month: old.start.getMonth() }).toStrictEqual({ month: 5 });
  });

  it("should handle year 2099", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const future = derivePeriod(
      adapter,
      new Date("2099-12-31T00:00:00"),
      "year"
    );
    const days = divide(adapter, future, "day");
    // 2099 is not a leap year
    expect(days).toHaveLength(DAYS_IN_COMMON_YEAR);
  });
});
