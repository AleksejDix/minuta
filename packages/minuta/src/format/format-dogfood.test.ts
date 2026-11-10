import type { DatePeriod, DateUnit } from "#src/types";
import {
  clamp,
  contains,
  createUnits,
  divide,
  gap,
  merge,
  next as nextPeriod,
  period,
  previous,
  round,
  same,
  shift,
  withUnits,
} from "#src/index";
import { date, zoned } from "#src/test/temporal";
import { describe, expect, it } from "vitest";
import { format, formatAsRange } from "#src/test/format";
import { Temporal } from "temporal-polyfill/full";

const time = withUnits(createUnits());
const FORWARD_TWO = 2;
const BACKWARD_THREE = -3;
const FORWARD_ONE = 1;
const QUARTERS_PER_YEAR = 4;
const LAST_QUARTER_INDEX = 3;
const MIN_WEEKS_IN_MONTH = 4;
const MAX_WEEKS_IN_MONTH = 6;
const DAYS_PER_WEEK = 7;
const SNAP_MINUTES = 15;
const NO_REMAINDER = 0;

/**
 * Derive a period from a local calendar date.
 *
 * @param isoDate - Local date as YYYY-MM-DD
 * @param unit - Unit of the period
 * @returns The period containing the date
 */
function unitPeriod(isoDate: string, unit: DateUnit): DatePeriod {
  return time[unit](date(isoDate));
}

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

describe("dogfood shift()", () => {
  it("forward 2 months from June", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const result = shift(unitPeriod("2024-06-15", "month"), FORWARD_TWO);
    expect(format(result)).toBe("August 2024");
  });

  it("backward across year boundary", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const result = shift(unitPeriod("2024-02-15", "month"), BACKWARD_THREE);
    expect(format(result)).toBe("November 2023");
  });

  it("forward 1 day from Jan 31", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const result = shift(unitPeriod("2024-01-31", "day"), FORWARD_ONE);
    expect(format(result)).toBe("February 1, 2024");
  });

  it("forward 1 year", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const result = shift(unitPeriod("2024-06-15", "year"), FORWARD_ONE);
    expect(format(result)).toBe("2025");
  });
});

describe("dogfood next()", () => {
  it("next month from December crosses year", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const result = nextPeriod(unitPeriod("2024-12-15", "month"));
    expect(format(result)).toBe("January 2025");
  });

  it("next day from Feb 28 in leap year", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const result = nextPeriod(unitPeriod("2024-02-28", "day"));
    expect(format(result)).toBe("February 29, 2024");
  });

  it("next day from Feb 28 in non-leap year", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const result = nextPeriod(unitPeriod("2025-02-28", "day"));
    expect(format(result)).toBe("March 1, 2025");
  });
});

describe("dogfood previous()", () => {
  it("previous month from January crosses year", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const result = previous(unitPeriod("2024-01-15", "month"));
    expect(format(result)).toBe("December 2023");
  });

  it("previous day from March 1", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const result = previous(unitPeriod("2024-03-01", "day"));
    expect(format(result)).toBe("February 29, 2024");
  });
});

describe("dogfood divide()", () => {
  it("q1 into months", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const q1 = unitPeriod("2024-01-15", "quarter");
    expect(
      divide(q1, "month").map((month: DatePeriod) => format(month))
    ).toStrictEqual(["January 2024", "February 2024", "March 2024"]);
  });

  it("year into quarters (by month count)", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const year = unitPeriod("2024-01-01", "year");
    const quarters = divide(year, "quarter");
    expect(quarters).toHaveLength(QUARTERS_PER_YEAR);
    const [first] = quarters;
    const last = quarters[LAST_QUARTER_INDEX];
    expect(format(required(first))).toContain("Jan");
    expect(format(required(first))).toContain("2024");
    expect(format(required(last))).toContain("Oct");
    expect(format(required(last))).toContain("2024");
  });

  it("month into weeks", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const march = unitPeriod("2026-03-01", "month");
    const weeks = divide(march, "week");
    expect(weeks.length).toBeGreaterThanOrEqual(MIN_WEEKS_IN_MONTH);
    expect(weeks.length).toBeLessThanOrEqual(MAX_WEEKS_IN_MONTH);
  });

  it("week into days", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const week = unitPeriod("2026-03-11", "week");
    const days = divide(week, "day");
    expect(days).toHaveLength(DAYS_PER_WEEK);
  });
});

describe("dogfood merge()", () => {
  it("merges 3 consecutive months into a quarter", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const jan = unitPeriod("2024-01-01", "month");
    const feb = unitPeriod("2024-02-01", "month");
    const mar = unitPeriod("2024-03-01", "month");
    const merged = required(merge([jan, feb, mar], "quarter"));
    expect(formatAsRange(merged)).toContain("Jan");
    expect(formatAsRange(merged)).toContain("Mar");
    expect(formatAsRange(merged)).toContain("2024");
  });
});

describe("dogfood contains()", () => {
  it("march contains March 15", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const march = unitPeriod("2026-03-01", "month");
    expect(contains(march, date("2026-03-15"))).toBe(true);
  });

  it("march does not contain April 1", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const march = unitPeriod("2026-03-01", "month");
    expect(contains(march, date("2026-04-01"))).toBe(false);
  });

  it("q1 contains February", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const q1 = unitPeriod("2024-01-01", "quarter");
    const feb = unitPeriod("2024-02-01", "month");
    expect(contains(q1, feb)).toBe(true);
  });
});

describe("dogfood same() and clamp()", () => {
  it("two days in same month", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const day1 = unitPeriod("2024-03-05", "day");
    const day2 = unitPeriod("2024-03-20", "day");
    expect(same(day1, day2, "month")).toBe(true);
  });

  it("two days in different months", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const day1 = unitPeriod("2024-03-31", "day");
    const day2 = unitPeriod("2024-04-01", "day");
    expect(same(day1, day2, "month")).toBe(false);
  });

  it("clamps a wide period to bounds", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const wide = period(date("2024-01-01"), date("2024-12-31"));
    const bounds = period(date("2024-03-01"), date("2024-06-30"));
    const result = required(clamp(wide, bounds));
    expect(formatAsRange(result)).toContain("Mar");
    expect(formatAsRange(result)).toContain("Jun");
  });
});

describe("dogfood snap()", () => {
  it("snaps a date to nearest 15-minute interval", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const moment = zoned("2024-03-15T10:38[UTC]");
    const snapped = round(moment, {
      roundingIncrement: SNAP_MINUTES,
      smallestUnit: "minute",
    });
    // Should round to nearest 15-min boundary
    expect(snapped.minute % SNAP_MINUTES).toBe(NO_REMAINDER);
  });

  it("floor snaps to earlier boundary", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const moment = zoned("2024-03-15T10:37[UTC]");
    const snapped = round(moment, {
      roundingIncrement: SNAP_MINUTES,
      roundingMode: "floor",
      smallestUnit: "minute",
    });
    expect(Temporal.ZonedDateTime.compare(snapped, moment)).toBeLessThanOrEqual(
      NO_REMAINDER
    );
  });

  it("ceil snaps to later boundary", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const moment = zoned("2024-03-15T10:37[UTC]");
    const snapped = round(moment, {
      roundingIncrement: SNAP_MINUTES,
      roundingMode: "ceil",
      smallestUnit: "minute",
    });
    expect(
      Temporal.ZonedDateTime.compare(snapped, moment)
    ).toBeGreaterThanOrEqual(NO_REMAINDER);
  });
});

describe("dogfood gap()", () => {
  it("finds gap between two periods", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const jan = unitPeriod("2024-01-01", "month");
    const mar = unitPeriod("2024-03-01", "month");
    const between = required(gap(jan, mar));
    expect(formatAsRange(between)).toContain("Feb");
  });

  it("finds no gap between adjacent periods", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const jan = unitPeriod("2024-01-01", "month");
    const feb = unitPeriod("2024-02-01", "month");
    expect(gap(jan, feb)).toBeUndefined();
  });
});
