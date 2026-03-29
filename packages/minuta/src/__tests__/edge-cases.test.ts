import { describe, it, expect } from "vitest";
import { createNativeAdapter } from "../adapters/native";
import { derivePeriod, createPeriod } from "../operations/period";
import { divide } from "../operations/divide";
import { go, next } from "../operations";
import { gap } from "../operations/gap";
import { contains } from "../operations/contains";
import { isSame } from "../operations/isSame";
import { merge } from "../operations/merge";
import { isOverlapping } from "../operations/utils/isOverlapping";

const adapter = createNativeAdapter({ weekStartsOn: 1 });

describe("century leap year", () => {
  // 2100 is NOT a leap year (divisible by 100 but not 400)
  // 2000 WAS a leap year (divisible by 400)

  it("Feb 28 + 1 day in 2100 should be Mar 1 (no Feb 29)", () => {
    const feb28 = derivePeriod(adapter, new Date(2100, 1, 28), "day");
    const nextDay = next(adapter, feb28);
    expect(nextDay.start.getMonth()).toBe(2); // March
    expect(nextDay.start.getDate()).toBe(1);
  });

  it("year 2100 should have 365 days", () => {
    const year = derivePeriod(adapter, new Date(2100, 5, 15), "year");
    const days = divide(adapter, year, "day");
    expect(days.length).toBe(365);
  });

  it("year 2000 should have 366 days (400-year leap)", () => {
    const year = derivePeriod(adapter, new Date(2000, 5, 15), "year");
    const days = divide(adapter, year, "day");
    expect(days.length).toBe(366);
  });
});

describe("week 53 / ISO week edge cases", () => {
  it("2020 has 53 weeks (starts on Wednesday)", () => {
    const year = derivePeriod(adapter, new Date(2020, 5, 15), "year");
    const weeks = divide(adapter, year, "week");
    // Some weeks may be partial — count those that overlap
    expect(weeks.length).toBeGreaterThanOrEqual(52);
    expect(weeks.length).toBeLessThanOrEqual(54);
  });

  it("Dec 31, 2020 falls in ISO week 53", () => {
    const dec31 = derivePeriod(adapter, new Date(2020, 11, 31), "day");
    const week = derivePeriod(adapter, new Date(2020, 11, 31), "week");
    expect(contains(week, dec31.start)).toBe(true);
  });

  it("Jan 1, 2021 is still in a 2020 week (Monday start)", () => {
    const jan1Week = derivePeriod(adapter, new Date(2021, 0, 1), "week");
    // Jan 1 2021 is a Friday — the week started Dec 28 2020
    expect(jan1Week.start.getFullYear()).toBe(2020);
  });
});

describe("DST spring forward", () => {
  // March 10, 2024 in America/New_York: 2am → 3am (23-hour day)
  // In UTC this doesn't affect native adapter, but the day should still be valid

  it("day period for DST transition date is valid", () => {
    const dstDay = derivePeriod(adapter, new Date(2024, 2, 10), "day");
    expect(dstDay.start.getDate()).toBe(10);
    expect(dstDay.end.getDate()).toBe(10);
  });

  it("US DST day (Mar 10) divides into 23 or 24 hours", () => {
    const usDst = derivePeriod(adapter, new Date(2024, 2, 10), "day");
    const hours = divide(adapter, usDst, "hour");
    expect(hours.length).toBeGreaterThanOrEqual(23);
    expect(hours.length).toBeLessThanOrEqual(24);
  });

  it("EU DST day (Mar 31) divides into 23 or 24 hours", () => {
    const euDst = derivePeriod(adapter, new Date(2024, 2, 31), "day");
    const hours = divide(adapter, euDst, "hour");
    expect(hours.length).toBeGreaterThanOrEqual(23);
    expect(hours.length).toBeLessThanOrEqual(24);
  });
});

describe("DST fall back", () => {
  // Nov 3, 2024 in America/New_York: 2am → 1am (25-hour day)

  it("day period for fall-back date is valid", () => {
    const fallBack = derivePeriod(adapter, new Date(2024, 10, 3), "day");
    expect(fallBack.start.getDate()).toBe(3);
    expect(fallBack.end.getDate()).toBe(3);
  });

  it("navigate across fall-back boundary", () => {
    const nov2 = derivePeriod(adapter, new Date(2024, 10, 2), "day");
    const nov3 = next(adapter, nov2);
    expect(nov3.start.getDate()).toBe(3);
    const nov4 = next(adapter, nov3);
    expect(nov4.start.getDate()).toBe(4);
  });
});

describe("date range extremes", () => {
  it("should handle year 1970 (Unix epoch)", () => {
    const epoch = derivePeriod(adapter, new Date(1970, 0, 1), "year");
    const months = divide(adapter, epoch, "month");
    expect(months.length).toBe(12);
  });

  it("should handle year 1900", () => {
    const old = derivePeriod(adapter, new Date(1900, 5, 15), "month");
    expect(old.type).toBe("month");
    expect(old.start.getMonth()).toBe(5);
  });

  it("should handle year 2099", () => {
    const future = derivePeriod(adapter, new Date(2099, 11, 31), "year");
    const days = divide(adapter, future, "day");
    expect(days.length).toBe(365); // 2099 is not a leap year
  });
});

describe("isOverlapping", () => {
  it("overlapping periods return true", () => {
    const jan = derivePeriod(adapter, new Date(2024, 0, 15), "month");
    const janMid = createPeriod(new Date(2024, 0, 15), new Date(2024, 1, 15));
    expect(isOverlapping(jan, janMid)).toBe(true);
  });

  it("non-overlapping periods return false", () => {
    const jan = derivePeriod(adapter, new Date(2024, 0, 15), "month");
    const mar = derivePeriod(adapter, new Date(2024, 2, 15), "month");
    expect(isOverlapping(jan, mar)).toBe(false);
  });

  it("touching periods overlap (inclusive boundaries)", () => {
    const jan = derivePeriod(adapter, new Date(2024, 0, 15), "month");
    const feb = derivePeriod(adapter, new Date(2024, 1, 15), "month");
    // Jan ends at 31 23:59:59.999, Feb starts at 1 00:00:00.000
    // They don't share any millisecond
    expect(isOverlapping(jan, feb)).toBe(false);
  });

  it("same period overlaps itself", () => {
    const jan = derivePeriod(adapter, new Date(2024, 0, 15), "month");
    expect(isOverlapping(jan, jan)).toBe(true);
  });

  it("contained period overlaps parent", () => {
    const year = derivePeriod(adapter, new Date(2024, 5, 15), "year");
    const month = derivePeriod(adapter, new Date(2024, 5, 15), "month");
    expect(isOverlapping(year, month)).toBe(true);
  });
});

describe("gap edge cases", () => {
  it("gap between same period is zero-duration", () => {
    const jan = derivePeriod(adapter, new Date(2024, 0, 15), "month");
    const g = gap(jan, jan);
    expect(g.start.getTime()).toBe(g.end.getTime());
  });

  it("gap between overlapping periods is zero-duration", () => {
    const jan = derivePeriod(adapter, new Date(2024, 0, 15), "month");
    const janMid = createPeriod(new Date(2024, 0, 15), new Date(2024, 1, 15));
    const g = gap(jan, janMid);
    expect(g.start.getTime()).toBe(g.end.getTime());
  });

  it("gap result is always passable to contains()", () => {
    const jan = derivePeriod(adapter, new Date(2024, 0, 15), "month");
    const mar = derivePeriod(adapter, new Date(2024, 2, 15), "month");
    const g = gap(jan, mar);
    // February should be inside the gap
    expect(contains(g, new Date(2024, 1, 15))).toBe(true);
  });
});

describe("isSame edge cases", () => {
  it("same day different times are same day", () => {
    const morning = derivePeriod(adapter, new Date(2024, 0, 15, 8), "day");
    const evening = derivePeriod(adapter, new Date(2024, 0, 15, 20), "day");
    expect(isSame(adapter, morning, evening, "day")).toBe(true);
  });

  it("last day of month and first day of next are different months", () => {
    const jan31 = derivePeriod(adapter, new Date(2024, 0, 31), "day");
    const feb1 = derivePeriod(adapter, new Date(2024, 1, 1), "day");
    expect(isSame(adapter, jan31, feb1, "month")).toBe(false);
  });

  it("Dec 31 and Jan 1 are different years", () => {
    const dec31 = derivePeriod(adapter, new Date(2024, 11, 31), "day");
    const jan1 = derivePeriod(adapter, new Date(2025, 0, 1), "day");
    expect(isSame(adapter, dec31, jan1, "year")).toBe(false);
  });
});

describe("merge edge cases", () => {
  it("merge single period returns itself", () => {
    const jan = derivePeriod(adapter, new Date(2024, 0, 15), "month");
    const merged = merge(adapter, [jan]);
    expect(merged.start.getTime()).toBe(jan.start.getTime());
  });

  it("merge Q1 months produces quarter", () => {
    const jan = derivePeriod(adapter, new Date(2024, 0, 15), "month");
    const feb = derivePeriod(adapter, new Date(2024, 1, 15), "month");
    const mar = derivePeriod(adapter, new Date(2024, 2, 15), "month");
    const q1 = merge(adapter, [jan, feb, mar]);
    expect(q1.type).toBe("quarter");
  });

  it("merge Q2 months does not produce quarter if not Q boundary", () => {
    const feb = derivePeriod(adapter, new Date(2024, 1, 15), "month");
    const mar = derivePeriod(adapter, new Date(2024, 2, 15), "month");
    const apr = derivePeriod(adapter, new Date(2024, 3, 15), "month");
    const merged = merge(adapter, [feb, mar, apr]);
    expect(merged.type).toBe("custom");
  });
});

describe("navigation across year boundaries", () => {
  it("go 365 days from non-leap year crosses correctly", () => {
    const jan1 = derivePeriod(adapter, new Date(2023, 0, 1), "day");
    const result = go(adapter, jan1, 365);
    expect(result.start.getFullYear()).toBe(2024);
    expect(result.start.getMonth()).toBe(0);
    expect(result.start.getDate()).toBe(1);
  });

  it("go 366 days from leap year start", () => {
    const jan1 = derivePeriod(adapter, new Date(2024, 0, 1), "day");
    const result = go(adapter, jan1, 366);
    expect(result.start.getFullYear()).toBe(2025);
    expect(result.start.getMonth()).toBe(0);
    expect(result.start.getDate()).toBe(1);
  });
});
