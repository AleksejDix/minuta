import { createPeriod, derivePeriod } from "#src/operations/period";
import { describe, expect, it } from "vitest";
import { contains } from "#src/operations/contains";
import { createNativeAdapter } from "#src/adapters/native/index";
import { gap } from "#src/operations/gap";
import { go } from "#src/operations";
import { isOverlapping } from "#src/operations/utils/is-overlapping";
import { isSame } from "#src/operations/is-same";
import { merge } from "#src/operations/merge";

const DAYS_IN_COMMON_YEAR = 365;
const DAYS_IN_LEAP_YEAR = 366;

const adapter = createNativeAdapter({ weekStartsOn: 1 });

describe("isOverlapping()", () => {
  it("overlapping periods return true", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const jan = derivePeriod(adapter, new Date("2024-01-15T00:00:00"), "month");
    const janMid = createPeriod(
      new Date("2024-01-15T00:00:00"),
      new Date("2024-02-15T00:00:00")
    );
    expect(isOverlapping(jan, janMid)).toBe(true);
  });

  it("non-overlapping periods return false", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const jan = derivePeriod(adapter, new Date("2024-01-15T00:00:00"), "month");
    const mar = derivePeriod(adapter, new Date("2024-03-15T00:00:00"), "month");
    expect(isOverlapping(jan, mar)).toBe(false);
  });

  it(
    "touching periods overlap (inclusive boundaries)",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const jan = derivePeriod(
        adapter,
        new Date("2024-01-15T00:00:00"),
        "month"
      );
      const feb = derivePeriod(
        adapter,
        new Date("2024-02-15T00:00:00"),
        "month"
      );
      /*
       * Jan ends at 31 23:59:59.999, Feb starts at 1 00:00:00.000
       * They don't share any millisecond
       */
      expect(isOverlapping(jan, feb)).toBe(false);
    }
  );
});

describe("isOverlapping() with identical or nested periods", () => {
  it("same period overlaps itself", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const jan = derivePeriod(adapter, new Date("2024-01-15T00:00:00"), "month");
    expect(isOverlapping(jan, jan)).toBe(true);
  });

  it("contained period overlaps parent", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const year = derivePeriod(adapter, new Date("2024-06-15T00:00:00"), "year");
    const month = derivePeriod(
      adapter,
      new Date("2024-06-15T00:00:00"),
      "month"
    );
    expect(isOverlapping(year, month)).toBe(true);
  });
});

describe("gap edge cases", () => {
  it("gap between same period is zero-duration", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const jan = derivePeriod(adapter, new Date("2024-01-15T00:00:00"), "month");
    const between = gap(jan, jan);
    expect(between.start.getTime()).toBe(between.end.getTime());
  });

  it(
    "gap between overlapping periods is zero-duration",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const jan = derivePeriod(
        adapter,
        new Date("2024-01-15T00:00:00"),
        "month"
      );
      const janMid = createPeriod(
        new Date("2024-01-15T00:00:00"),
        new Date("2024-02-15T00:00:00")
      );
      const between = gap(jan, janMid);
      expect(between.start.getTime()).toBe(between.end.getTime());
    }
  );

  it("gap result is always passable to contains()", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const jan = derivePeriod(adapter, new Date("2024-01-15T00:00:00"), "month");
    const mar = derivePeriod(adapter, new Date("2024-03-15T00:00:00"), "month");
    const between = gap(jan, mar);
    // February should be inside the gap
    expect(contains(between, new Date("2024-02-15T00:00:00"))).toBe(true);
  });
});

describe("isSame edge cases", () => {
  it("same day different times are same day", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const morning = derivePeriod(
      adapter,
      new Date("2024-01-15T08:00:00"),
      "day"
    );
    const evening = derivePeriod(
      adapter,
      new Date("2024-01-15T20:00:00"),
      "day"
    );
    expect(isSame(adapter, morning, evening, "day")).toBe(true);
  });

  it(
    "last day of month and first day of next are different months",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const jan31 = derivePeriod(
        adapter,
        new Date("2024-01-31T00:00:00"),
        "day"
      );
      const feb1 = derivePeriod(
        adapter,
        new Date("2024-02-01T00:00:00"),
        "day"
      );
      expect(isSame(adapter, jan31, feb1, "month")).toBe(false);
    }
  );

  it("dec 31 and Jan 1 are different years", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const dec31 = derivePeriod(adapter, new Date("2024-12-31T00:00:00"), "day");
    const jan1 = derivePeriod(adapter, new Date("2025-01-01T00:00:00"), "day");
    expect(isSame(adapter, dec31, jan1, "year")).toBe(false);
  });
});

describe("merge edge cases", () => {
  it("merge single period returns itself", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const jan = derivePeriod(adapter, new Date("2024-01-15T00:00:00"), "month");
    const merged = merge([jan]);
    expect(merged.start.getTime()).toBe(jan.start.getTime());
  });

  it("merge Q1 months produces custom period", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const jan = derivePeriod(adapter, new Date("2024-01-15T00:00:00"), "month");
    const feb = derivePeriod(adapter, new Date("2024-02-15T00:00:00"), "month");
    const mar = derivePeriod(adapter, new Date("2024-03-15T00:00:00"), "month");
    const q1 = merge([jan, feb, mar]);
    expect(q1.type).toBe("custom");
  });

  it(
    "merge Q2 months does not produce quarter if not Q boundary",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const feb = derivePeriod(
        adapter,
        new Date("2024-02-15T00:00:00"),
        "month"
      );
      const mar = derivePeriod(
        adapter,
        new Date("2024-03-15T00:00:00"),
        "month"
      );
      const apr = derivePeriod(
        adapter,
        new Date("2024-04-15T00:00:00"),
        "month"
      );
      const merged = merge([feb, mar, apr]);
      expect(merged.type).toBe("custom");
    }
  );
});

describe("navigation across year boundaries", () => {
  it(
    "go 365 days from non-leap year crosses correctly",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const jan1 = derivePeriod(
        adapter,
        new Date("2023-01-01T00:00:00"),
        "day"
      );
      const result = go(adapter, jan1, DAYS_IN_COMMON_YEAR);
      expect({
        date: result.start.getDate(),
        month: result.start.getMonth(),
        year: result.start.getFullYear(),
      }).toStrictEqual({ date: 1, month: 0, year: 2024 });
    }
  );

  it("go 366 days from leap year start", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const jan1 = derivePeriod(adapter, new Date("2024-01-01T00:00:00"), "day");
    const result = go(adapter, jan1, DAYS_IN_LEAP_YEAR);
    expect({
      date: result.start.getDate(),
      month: result.start.getMonth(),
      year: result.start.getFullYear(),
    }).toStrictEqual({ date: 1, month: 0, year: 2025 });
  });
});
