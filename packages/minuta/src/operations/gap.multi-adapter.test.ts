import { createPeriod, derivePeriod as period } from "./period";
import { describe, expect, it } from "vitest";
import { gap } from "./gap";
import { getAdapterTestCases } from "#src/test/shared-adapter-tests";

const ONE_MS = 1;
const YEAR_2021 = 2021;
const YEAR_2023 = 2023;

const adapters = getAdapterTestCases();

describe.each(adapters)(
  "gap() between periods with %s adapter",
  (_name, adapter) => {
    it(
      "should calculate difference between two non-overlapping periods",
      { timeout: 5000 },
      () => {
        expect.hasAssertions();
        const jan = period(adapter, new Date("2024-01-15T00:00"), "month");
        const march = period(adapter, new Date("2024-03-15T00:00"), "month");

        const diff = gap(jan, march);

        expect(diff.type).toBe("custom");
        // Should be the gap between Jan 31 and March 1 (February)
        expect(diff.start.getTime()).toBe(jan.end.getTime() + ONE_MS);
        expect(diff.end.getTime()).toBe(march.start.getTime() - ONE_MS);
      }
    );

    it("should handle custom periods", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const custom1 = createPeriod(
        new Date("2024-01-01T00:00"),
        new Date("2024-01-10T00:00")
      );
      const custom2 = createPeriod(
        new Date("2024-01-20T00:00"),
        new Date("2024-01-31T00:00")
      );

      const diff = gap(custom1, custom2);

      expect(diff.type).toBe("custom");
      // Gap from Jan 10 end to Jan 20 start
      expect(diff.start.getTime()).toBe(custom1.end.getTime() + ONE_MS);
      expect(diff.end.getTime()).toBe(custom2.start.getTime() - ONE_MS);
    });
  }
);

describe.each(adapters)("gap() between dates with %s adapter", () => {
  it("should calculate difference between two dates", { timeout: 5000 }, () => {
    expect.hasAssertions();
    // Jan 1
    const date1 = new Date("2024-01-01T00:00");
    // Jan 10
    const date2 = new Date("2024-01-10T00:00");

    const diff = gap(date1, date2);

    expect(diff.type).toBe("custom");
    expect(diff.start.getTime()).toBe(date1.getTime());
    expect(diff.end.getTime()).toBe(date2.getTime());
  });

  it("should return period spanning the two dates", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const date1 = new Date("2024-01-01T00:00");
    const date2 = new Date("2024-01-10T00:00");

    const diff = gap(date1, date2);

    expect(diff.start.getTime()).toBe(date1.getTime());
    expect(diff.end.getTime()).toBe(date2.getTime());
  });

  it(
    "should normalize reversed date-to-date so start <= end",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const later = new Date("2024-01-10T00:00");
      const earlier = new Date("2024-01-01T00:00");

      const diff = gap(later, earlier);

      expect(diff.type).toBe("custom");
      expect(diff.start.getTime()).toBe(earlier.getTime());
      expect(diff.end.getTime()).toBe(later.getTime());
    }
  );
});

describe.each(adapters)(
  "gap() between mixed points with %s adapter",
  (_name, adapter) => {
    it("should handle period to date", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const jan = period(adapter, new Date("2024-01-15T00:00"), "month");
      const feb15 = new Date("2024-02-15T00:00");

      const diff = gap(jan, feb15);

      expect(diff.type).toBe("custom");
      expect(diff.start.getTime()).toBe(jan.end.getTime() + ONE_MS);
      expect(diff.end.getTime()).toBe(feb15.getTime());
    });

    it("should handle date to period", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const jan15 = new Date("2024-01-15T00:00");
      const march = period(adapter, new Date("2024-03-15T00:00"), "month");

      const diff = gap(jan15, march);

      expect(diff.type).toBe("custom");
      expect(diff.start.getTime()).toBe(jan15.getTime());
      expect(diff.end.getTime()).toBe(march.start.getTime() - ONE_MS);
    });

    it("should handle reversed order (to < from)", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const march = period(adapter, new Date("2024-03-15T00:00"), "month");
      const jan = period(adapter, new Date("2024-01-15T00:00"), "month");

      // Reversed: gap from jan.end to march.start (same as forward)
      const diff = gap(march, jan);

      expect(diff.type).toBe("custom");
      expect(diff.start.getTime()).toBe(jan.end.getTime() + ONE_MS);
      expect(diff.end.getTime()).toBeGreaterThanOrEqual(diff.start.getTime());
    });
  }
);

describe.each(adapters)(
  "gap() without a gap with %s adapter",
  (_name, adapter) => {
    it("should handle touching periods (no gap)", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const jan = period(adapter, new Date("2024-01-15T00:00"), "month");
      const feb = period(adapter, new Date("2024-02-15T00:00"), "month");

      // Touching periods have no gap — zero-duration result
      const diff = gap(jan, feb);

      expect(diff.type).toBe("custom");
      expect(diff.start.getTime()).toBe(diff.end.getTime());
    });

    it("should handle overlapping periods", { timeout: 5000 }, () => {
      expect.hasAssertions();
      // All of January
      const period1 = period(adapter, new Date("2024-01-15T00:00"), "month");
      const period2 = createPeriod(
        new Date("2024-01-20T00:00"),
        // Jan 20 - Feb 10
        new Date("2024-02-10T00:00")
      );

      const diff = gap(period1, period2);

      expect(diff.type).toBe("custom");
      // Overlapping periods have no gap — zero-duration
      expect(diff.start.getTime()).toBe(diff.end.getTime());
    });

    it("should handle same period", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const jan = period(adapter, new Date("2024-01-15T00:00"), "month");

      // Same period has no gap — zero-duration
      const diff = gap(jan, jan);

      expect(diff.type).toBe("custom");
      expect(diff.start.getTime()).toBe(diff.end.getTime());
    });
  }
);

describe.each(adapters)("gap() of zero duration with %s adapter", () => {
  it(
    "should handle same date/period (zero duration)",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const date = new Date("2024-01-15T00:00");

      const diff = gap(date, date);

      expect(diff.type).toBe("custom");
      expect(diff.start.getTime()).toBe(date.getTime());
      expect(diff.end.getTime()).toBe(date.getTime());
    }
  );
});

describe.each(adapters)(
  "gap() across units with %s adapter",
  (_name, adapter) => {
    it("should handle different time units", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const week1 = period(adapter, new Date("2024-01-08T00:00"), "week");
      const week3 = period(adapter, new Date("2024-01-22T00:00"), "week");

      const diff = gap(week1, week3);

      expect(diff.type).toBe("custom");
      // Should be the gap between week1 and week3 (week2)
      expect(diff.start.getTime()).toBe(week1.end.getTime() + ONE_MS);
      expect(diff.end.getTime()).toBe(week3.start.getTime() - ONE_MS);
    });

    it("should handle hour periods", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const hour1 = period(adapter, new Date("2024-01-15T10:00"), "hour");
      const hour3 = period(adapter, new Date("2024-01-15T12:00"), "hour");

      const diff = gap(hour1, hour3);

      expect(diff.type).toBe("custom");
      // Should be the gap (hour 11)
      expect(diff.start.getTime()).toBe(hour1.end.getTime() + ONE_MS);
      expect(diff.end.getTime()).toBe(hour3.start.getTime() - ONE_MS);
    });

    it("should handle minute periods", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const min1 = period(adapter, new Date("2024-01-15T10:00"), "minute");
      const min5 = period(adapter, new Date("2024-01-15T10:04"), "minute");

      const diff = gap(min1, min5);

      expect(diff.type).toBe("custom");
      // Should be the gap (minutes 1-3)
      expect(diff.start.getTime()).toBe(min1.end.getTime() + ONE_MS);
      expect(diff.end.getTime()).toBe(min5.start.getTime() - ONE_MS);
    });
  }
);

describe.each(adapters)(
  "gap() across years with %s adapter",
  (_name, adapter) => {
    it("should handle year periods with large gaps", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const year2020 = period(adapter, new Date("2020-01-15T00:00"), "year");
      const year2024 = period(adapter, new Date("2024-01-15T00:00"), "year");

      const diff = gap(year2020, year2024);

      expect(diff.type).toBe("custom");
      // Should span 2021-2023
      expect(diff.start.getTime()).toBe(year2020.end.getTime() + ONE_MS);
      expect(diff.end.getTime()).toBe(year2024.start.getTime() - ONE_MS);
      expect(diff.start.getFullYear()).toBe(YEAR_2021);
      expect(diff.end.getFullYear()).toBe(YEAR_2023);
    });
  }
);
