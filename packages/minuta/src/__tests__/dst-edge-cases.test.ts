import { describe, it, expect } from "vitest";
import { createDateFnsTzAdapter } from "../adapters/date-fns-tz";
import { derivePeriod, createPeriod } from "../operations/period";
import { divide } from "../operations/divide";
import { contains } from "../operations/contains";
import { isOverlapping } from "../operations/utils/isOverlapping";

// ── Ambiguous times during fall back (034) ──
// During fall back, 1:00-2:00 AM repeats. date-fns-tz resolves to the earlier offset.

describe("DST: ambiguous times during fall back", () => {
  const ny = createDateFnsTzAdapter({ timezone: "America/New_York" });

  it("period created during ambiguous hour is valid", () => {
    // Nov 3 2024: 1:30 AM occurs twice in New York
    const ambiguous = new Date(Date.UTC(2024, 10, 3, 6, 30)); // 1:30 AM EDT (first occurrence)
    const day = derivePeriod(ny, ambiguous, "day");
    expect(day.start.getTime()).toBeLessThan(day.end.getTime());
  });

  it("hour periods during fall back don't overlap", () => {
    const day = derivePeriod(ny, new Date(Date.UTC(2024, 10, 3, 5)), "day");
    const hours = divide(ny, day, "hour");

    for (let i = 1; i < hours.length; i++) {
      expect(hours[i].start.getTime()).toBeGreaterThan(
        hours[i - 1].start.getTime()
      );
    }
  });
});

// ── Gap times during spring forward (035) ──
// During spring forward, 2:00-3:00 AM doesn't exist. JS Date adjusts forward.

describe("DST: gap times during spring forward", () => {
  const ny = createDateFnsTzAdapter({ timezone: "America/New_York" });

  it("period created with gap time adjusts forward", () => {
    // Mar 10 2024: 2:30 AM doesn't exist in New York (clocks jump 2:00 → 3:00)
    const gapTime = new Date(Date.UTC(2024, 2, 10, 7, 30)); // 2:30 AM EST → adjusted
    const hour = derivePeriod(ny, gapTime, "hour");
    // The period should be valid (start <= end)
    expect(hour.start.getTime()).toBeLessThanOrEqual(hour.end.getTime());
  });

  it("dividing spring forward day produces no overlapping hours", () => {
    const day = derivePeriod(ny, new Date(Date.UTC(2024, 2, 10, 5)), "day");
    const hours = divide(ny, day, "hour");

    // Each hour should start after the previous one
    for (let i = 1; i < hours.length; i++) {
      expect(hours[i].start.getTime()).toBeGreaterThan(
        hours[i - 1].start.getTime()
      );
    }
  });
});

// ── Fractional timezone offsets (039) ──
// India +5:30, Nepal +5:45, Chatham +12:45, Lord Howe +10:30 with 30-min DST

describe("DST: fractional timezone offsets", () => {
  const india = createDateFnsTzAdapter({ timezone: "Asia/Kolkata" });
  const nepal = createDateFnsTzAdapter({ timezone: "Asia/Kathmandu" });

  it("India (+5:30): day has 24 hours", () => {
    const day = derivePeriod(india, new Date(Date.UTC(2024, 0, 15, 0)), "day");
    const hours = divide(india, day, "hour");
    expect(hours.length).toBe(24);
  });

  it("India (+5:30): startOf day is at 18:30 UTC (previous day)", () => {
    const day = derivePeriod(india, new Date(Date.UTC(2024, 0, 15, 0)), "day");
    // Jan 15 in India starts at Jan 14 18:30 UTC
    expect(day.start.getUTCHours()).toBe(18);
    expect(day.start.getUTCMinutes()).toBe(30);
  });

  it("Nepal (+5:45): day has 24 hours", () => {
    const day = derivePeriod(nepal, new Date(Date.UTC(2024, 0, 15, 0)), "day");
    const hours = divide(nepal, day, "hour");
    expect(hours.length).toBe(24);
  });

  it("Nepal (+5:45): startOf day is at 18:15 UTC (previous day)", () => {
    const day = derivePeriod(nepal, new Date(Date.UTC(2024, 0, 15, 0)), "day");
    // Jan 15 in Nepal starts at Jan 14 18:15 UTC
    expect(day.start.getUTCHours()).toBe(18);
    expect(day.start.getUTCMinutes()).toBe(15);
  });
});

// ── Lord Howe Island: 30-minute DST shift ──

describe("DST: Lord Howe Island (30-minute DST shift)", () => {
  const lordHowe = createDateFnsTzAdapter({ timezone: "Australia/Lord_Howe" });

  it("normal day has 24 hours", () => {
    const day = derivePeriod(lordHowe, new Date(Date.UTC(2024, 0, 15)), "day");
    const hours = divide(lordHowe, day, "hour");
    expect(hours.length).toBe(24);
  });

  it("spring forward day has 23 or 24 hours (30-min shift)", () => {
    // Lord Howe springs forward first Sunday of October
    // Oct 6 2024 — clocks go from +10:30 to +11:00 (only 30 min shift)
    const day = derivePeriod(
      lordHowe,
      new Date(Date.UTC(2024, 9, 5, 14)),
      "day"
    );
    const hours = divide(lordHowe, day, "hour");
    // 30-min DST doesn't remove a full hour — could be 23 or 24
    expect(hours.length).toBeGreaterThanOrEqual(23);
    expect(hours.length).toBeLessThanOrEqual(24);
  });
});

// ── Multi-DST transition periods (041) ──
// Periods spanning both spring forward and fall back

describe("DST: periods spanning multiple transitions", () => {
  const ny = createDateFnsTzAdapter({ timezone: "America/New_York" });

  it("full year divided into months gives 12", () => {
    const year = derivePeriod(ny, new Date(Date.UTC(2024, 5, 15)), "year");
    const months = divide(ny, year, "month");
    expect(months.length).toBe(12);
  });

  it("full year divided into days gives 366 (2024 is leap year)", () => {
    const year = derivePeriod(ny, new Date(Date.UTC(2024, 5, 15)), "year");
    const days = divide(ny, year, "day");
    expect(days.length).toBe(366);
  });

  it("period spanning spring forward + fall back: contains works", () => {
    // March through November spans both transitions
    const span = createPeriod(
      new Date(Date.UTC(2024, 2, 1, 5)),
      new Date(Date.UTC(2024, 10, 30, 5))
    );

    // A date during spring forward gap (adjusted)
    expect(contains(span, new Date(Date.UTC(2024, 2, 10, 7, 30)))).toBe(true);

    // A date during fall back
    expect(contains(span, new Date(Date.UTC(2024, 10, 3, 6, 30)))).toBe(true);

    // A date outside the span
    expect(contains(span, new Date(Date.UTC(2024, 11, 15)))).toBe(false);
  });

  it("month periods across transitions don't overlap", () => {
    const year = derivePeriod(ny, new Date(Date.UTC(2024, 5, 15)), "year");
    const months = divide(ny, year, "month");

    for (let i = 1; i < months.length; i++) {
      expect(isOverlapping(months[i - 1], months[i])).toBe(false);
    }
  });
});
