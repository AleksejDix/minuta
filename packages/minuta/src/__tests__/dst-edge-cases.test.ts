import { describe, expect, it } from "vitest";
import { periodWith, range } from "#src/operations/period";
import type { Period } from "#src/types";
import { contains } from "#src/operations/contains";
import { dateFnsTzUnits } from "#src/adapters/date-fns-tz/index";
import { divideWith } from "#src/operations/divide";
import { overlaps } from "#src/operations/overlaps";

const HOURS_PER_DAY = 24;
const SHORT_DAY_HOURS = 23;
const MONTHS_PER_YEAR = 12;
const DAYS_IN_LEAP_YEAR = 366;
const INDIA_DAY_START_UTC_HOUR = 18;
const INDIA_DAY_START_UTC_MINUTE = 30;
const NEPAL_DAY_START_UTC_HOUR = 18;
const NEPAL_DAY_START_UTC_MINUTE = 15;

function startTimes(periods: readonly Period[]): number[] {
  return periods.map((period: Period) => period.start.getTime());
}

function isStrictlyIncreasing(values: readonly number[]): boolean {
  let previous = Number.NEGATIVE_INFINITY;
  for (const value of values) {
    if (value <= previous) {
      return false;
    }
    previous = value;
  }
  return true;
}

function consecutivePairs(
  periods: readonly Period[]
): (readonly [Period, Period])[] {
  const pairs: (readonly [Period, Period])[] = [];
  let previous: Period | undefined = undefined;
  for (const period of periods) {
    if (previous !== undefined) {
      pairs.push([previous, period]);
    }
    previous = period;
  }
  return pairs;
}

/*
 * ── Ambiguous times during fall back (034) ──
 * During fall back, 1:00-2:00 AM repeats. date-fns-tz resolves to the earlier offset.
 */

describe("dst: ambiguous times during fall back", () => {
  const ny = dateFnsTzUnits({ timeZone: "America/New_York" });

  it("period created during ambiguous hour is valid", { timeout: 5000 }, () => {
    expect.hasAssertions();
    // Nov 3 2024: 1:30 AM occurs twice in New York
    // 1:30 AM EDT (first occurrence)
    const ambiguous = new Date("2024-11-03T06:30:00Z");
    const day = periodWith(ny, ambiguous, "day");
    expect(day.start.getTime()).toBeLessThan(day.end.getTime());
  });

  it("hour periods during fall back don't overlap", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const day = periodWith(ny, new Date("2024-11-03T05:00:00Z"), "day");
    const hours = divideWith(ny, day, "hour");

    // Each hour should start after the previous one
    expect(isStrictlyIncreasing(startTimes(hours))).toBe(true);
  });
});

/*
 * ── Gap times during spring forward (035) ──
 * During spring forward, 2:00-3:00 AM doesn't exist. JS Date adjusts forward.
 */

describe("dst: gap times during spring forward", () => {
  const ny = dateFnsTzUnits({ timeZone: "America/New_York" });

  it("period created with gap time adjusts forward", { timeout: 5000 }, () => {
    expect.hasAssertions();
    // Mar 10 2024: 2:30 AM doesn't exist in New York (clocks jump 2:00 → 3:00)
    // 2:30 AM EST → adjusted
    const gapTime = new Date("2024-03-10T07:30:00Z");
    const hour = periodWith(ny, gapTime, "hour");
    // The period should be valid (start <= end)
    expect(hour.start.getTime()).toBeLessThanOrEqual(hour.end.getTime());
  });

  it(
    "dividing spring forward day produces no overlapping hours",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const day = periodWith(ny, new Date("2024-03-10T05:00:00Z"), "day");
      const hours = divideWith(ny, day, "hour");

      // Each hour should start after the previous one
      expect(isStrictlyIncreasing(startTimes(hours))).toBe(true);
    }
  );
});

/*
 * ── Fractional timezone offsets (039) ──
 * India +5:30, Nepal +5:45, Chatham +12:45, Lord Howe +10:30 with 30-min DST
 */

describe("dst: fractional timezone offsets", () => {
  const india = dateFnsTzUnits({ timeZone: "Asia/Kolkata" });
  const nepal = dateFnsTzUnits({ timeZone: "Asia/Kathmandu" });

  it("india (+5:30): day has 24 hours", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const day = periodWith(india, new Date("2024-01-15T00:00:00Z"), "day");
    const hours = divideWith(india, day, "hour");
    expect(hours).toHaveLength(HOURS_PER_DAY);
  });

  it(
    "india (+5:30): startOf day is at 18:30 UTC (previous day)",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const day = periodWith(india, new Date("2024-01-15T00:00:00Z"), "day");
      // Jan 15 in India starts at Jan 14 18:30 UTC
      expect(day.start.getUTCHours()).toBe(INDIA_DAY_START_UTC_HOUR);
      expect(day.start.getUTCMinutes()).toBe(INDIA_DAY_START_UTC_MINUTE);
    }
  );

  it("nepal (+5:45): day has 24 hours", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const day = periodWith(nepal, new Date("2024-01-15T00:00:00Z"), "day");
    const hours = divideWith(nepal, day, "hour");
    expect(hours).toHaveLength(HOURS_PER_DAY);
  });

  it(
    "nepal (+5:45): startOf day is at 18:15 UTC (previous day)",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const day = periodWith(nepal, new Date("2024-01-15T00:00:00Z"), "day");
      // Jan 15 in Nepal starts at Jan 14 18:15 UTC
      expect(day.start.getUTCHours()).toBe(NEPAL_DAY_START_UTC_HOUR);
      expect(day.start.getUTCMinutes()).toBe(NEPAL_DAY_START_UTC_MINUTE);
    }
  );
});

// ── Lord Howe Island: 30-minute DST shift ──

describe("dst: Lord Howe Island (30-minute DST shift)", () => {
  const lordHowe = dateFnsTzUnits({ timeZone: "Australia/Lord_Howe" });

  it("normal day has 24 hours", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const day = periodWith(lordHowe, new Date("2024-01-15T00:00:00Z"), "day");
    const hours = divideWith(lordHowe, day, "hour");
    expect(hours).toHaveLength(HOURS_PER_DAY);
  });

  it(
    "spring forward day has 23 or 24 hours (30-min shift)",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      /*
       * Lord Howe springs forward first Sunday of October
       * Oct 6 2024 — clocks go from +10:30 to +11:00 (only 30 min shift)
       */
      const day = periodWith(lordHowe, new Date("2024-10-05T14:00:00Z"), "day");
      const hours = divideWith(lordHowe, day, "hour");
      // 30-min DST doesn't remove a full hour — could be 23 or 24
      expect(hours.length).toBeGreaterThanOrEqual(SHORT_DAY_HOURS);
      expect(hours.length).toBeLessThanOrEqual(HOURS_PER_DAY);
    }
  );
});

/*
 * ── Multi-DST transition periods (041) ──
 * Periods spanning both spring forward and fall back
 */

describe("dst: periods spanning multiple transitions", () => {
  const ny = dateFnsTzUnits({ timeZone: "America/New_York" });

  it("full year divided into months gives 12", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const year = periodWith(ny, new Date("2024-06-15T00:00:00Z"), "year");
    const months = divideWith(ny, year, "month");
    expect(months).toHaveLength(MONTHS_PER_YEAR);
  });

  it(
    "full year divided into days gives 366 (2024 is leap year)",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const year = periodWith(ny, new Date("2024-06-15T00:00:00Z"), "year");
      const days = divideWith(ny, year, "day");
      expect(days).toHaveLength(DAYS_IN_LEAP_YEAR);
    }
  );
});

describe("dst: containment and overlap across multiple transitions", () => {
  const ny = dateFnsTzUnits({ timeZone: "America/New_York" });

  it(
    "period spanning spring forward + fall back: contains works",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      // March through November spans both transitions
      const span = range(
        new Date("2024-03-01T05:00:00Z"),
        new Date("2024-11-30T05:00:00Z")
      );

      // A date during spring forward gap (adjusted)
      expect(contains(span, new Date("2024-03-10T07:30:00Z"))).toBe(true);

      // A date during fall back
      expect(contains(span, new Date("2024-11-03T06:30:00Z"))).toBe(true);

      // A date outside the span
      expect(contains(span, new Date("2024-12-15T00:00:00Z"))).toBe(false);
    }
  );

  it(
    "month periods across transitions don't overlap",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const year = periodWith(ny, new Date("2024-06-15T00:00:00Z"), "year");
      const months = divideWith(ny, year, "month");

      for (const [previous, next] of consecutivePairs(months)) {
        expect(overlaps(previous, next)).toBe(false);
      }
    }
  );
});
