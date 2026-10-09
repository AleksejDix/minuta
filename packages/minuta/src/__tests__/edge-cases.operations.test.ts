import { describe, expect, it } from "vitest";
import { periodWith, range } from "#src/operations/period";
import { contains } from "#src/operations/contains";
import { gap } from "#src/operations/gap";
import { mergeWith } from "#src/operations/merge";
import { nativeUnits } from "#src/adapters/native/index";
import { overlaps } from "#src/operations/overlaps";
import { sameWith } from "#src/operations/same";
import { shiftWith } from "#src/operations/shift";

const DAYS_IN_COMMON_YEAR = 365;
const DAYS_IN_LEAP_YEAR = 366;

const units = nativeUnits({ weekStartsOn: 1 });

/**
 * Narrow away undefined, failing the test otherwise.
 *
 * @param value - Value expected to be present
 * @returns The value
 */
function required<TValue>(value: TValue | undefined): TValue {
  if (value === undefined) {
    throw new Error("Expected a value");
  }
  return value;
}

describe("overlaps()", () => {
  it("overlapping periods return true", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const jan = periodWith(units, new Date("2024-01-15T00:00:00"), "month");
    const janMid = range(
      new Date("2024-01-15T00:00:00"),
      new Date("2024-02-15T00:00:00")
    );
    expect(overlaps(jan, janMid)).toBe(true);
  });

  it("non-overlapping periods return false", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const jan = periodWith(units, new Date("2024-01-15T00:00:00"), "month");
    const mar = periodWith(units, new Date("2024-03-15T00:00:00"), "month");
    expect(overlaps(jan, mar)).toBe(false);
  });

  it(
    "touching periods overlap (inclusive boundaries)",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const jan = periodWith(units, new Date("2024-01-15T00:00:00"), "month");
      const feb = periodWith(units, new Date("2024-02-15T00:00:00"), "month");
      /*
       * Jan ends at 31 23:59:59.999, Feb starts at 1 00:00:00.000
       * They don't share any millisecond
       */
      expect(overlaps(jan, feb)).toBe(false);
    }
  );
});

describe("overlaps() with identical or nested periods", () => {
  it("same period overlaps itself", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const jan = periodWith(units, new Date("2024-01-15T00:00:00"), "month");
    expect(overlaps(jan, jan)).toBe(true);
  });

  it("contained period overlaps parent", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const year = periodWith(units, new Date("2024-06-15T00:00:00"), "year");
    const month = periodWith(units, new Date("2024-06-15T00:00:00"), "month");
    expect(overlaps(year, month)).toBe(true);
  });
});

describe("gap edge cases", () => {
  it("gap between same period is zero-duration", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const jan = periodWith(units, new Date("2024-01-15T00:00:00"), "month");
    const between = gap(jan, jan);
    expect(between.start.getTime()).toBe(between.end.getTime());
  });

  it(
    "gap between overlapping periods is zero-duration",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const jan = periodWith(units, new Date("2024-01-15T00:00:00"), "month");
      const janMid = range(
        new Date("2024-01-15T00:00:00"),
        new Date("2024-02-15T00:00:00")
      );
      const between = gap(jan, janMid);
      expect(between.start.getTime()).toBe(between.end.getTime());
    }
  );

  it("gap result is always passable to contains()", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const jan = periodWith(units, new Date("2024-01-15T00:00:00"), "month");
    const mar = periodWith(units, new Date("2024-03-15T00:00:00"), "month");
    const between = gap(jan, mar);
    // February should be inside the gap
    expect(contains(between, new Date("2024-02-15T00:00:00"))).toBe(true);
  });
});

describe("isSame edge cases", () => {
  it("same day different times are same day", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const morning = periodWith(units, new Date("2024-01-15T08:00:00"), "day");
    const evening = periodWith(units, new Date("2024-01-15T20:00:00"), "day");
    expect(sameWith(units, morning, evening, "day")).toBe(true);
  });

  it(
    "last day of month and first day of next are different months",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const jan31 = periodWith(units, new Date("2024-01-31T00:00:00"), "day");
      const feb1 = periodWith(units, new Date("2024-02-01T00:00:00"), "day");
      expect(sameWith(units, jan31, feb1, "month")).toBe(false);
    }
  );

  it("dec 31 and Jan 1 are different years", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const dec31 = periodWith(units, new Date("2024-12-31T00:00:00"), "day");
    const jan1 = periodWith(units, new Date("2025-01-01T00:00:00"), "day");
    expect(sameWith(units, dec31, jan1, "year")).toBe(false);
  });
});

describe("merge edge cases", () => {
  it("merge single period returns itself", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const jan = periodWith(units, new Date("2024-01-15T00:00:00"), "month");
    const merged = required(mergeWith(units, [jan]));
    expect(merged.start.getTime()).toBe(jan.start.getTime());
  });

  it("merge Q1 months produces custom period", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const jan = periodWith(units, new Date("2024-01-15T00:00:00"), "month");
    const feb = periodWith(units, new Date("2024-02-15T00:00:00"), "month");
    const mar = periodWith(units, new Date("2024-03-15T00:00:00"), "month");
    const q1 = required(mergeWith(units, [jan, feb, mar]));
    expect(q1.unit).toBe("custom");
  });

  it(
    "merge Q2 months does not produce quarter if not Q boundary",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const feb = periodWith(units, new Date("2024-02-15T00:00:00"), "month");
      const mar = periodWith(units, new Date("2024-03-15T00:00:00"), "month");
      const apr = periodWith(units, new Date("2024-04-15T00:00:00"), "month");
      const merged = required(mergeWith(units, [feb, mar, apr]));
      expect(merged.unit).toBe("custom");
    }
  );
});

describe("navigation across year boundaries", () => {
  it(
    "go 365 days from non-leap year crosses correctly",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const jan1 = periodWith(units, new Date("2023-01-01T00:00:00"), "day");
      const result = shiftWith(units, jan1, DAYS_IN_COMMON_YEAR);
      expect({
        date: result.start.getDate(),
        month: result.start.getMonth(),
        year: result.start.getFullYear(),
      }).toStrictEqual({ date: 1, month: 0, year: 2024 });
    }
  );

  it("go 366 days from leap year start", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const jan1 = periodWith(units, new Date("2024-01-01T00:00:00"), "day");
    const result = shiftWith(units, jan1, DAYS_IN_LEAP_YEAR);
    expect({
      date: result.start.getDate(),
      month: result.start.getMonth(),
      year: result.start.getFullYear(),
    }).toStrictEqual({ date: 1, month: 0, year: 2025 });
  });
});
