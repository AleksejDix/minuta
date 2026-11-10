import type { BuiltInUnit, Period, TimeValue } from "#src/types";
import {
  day,
  next as defaultNext,
  divide,
  hour,
  minute,
  month,
  period,
  previous,
  quarter,
  same,
  second,
  shift,
  week,
  withUnits,
  year,
} from "#src/index";
import { describe, expect, it } from "vitest";
import type { Minuta } from "#src/with-units";
import { createUnits } from "#src/create-units";
import { zoned } from "#src/test/temporal";

const UNITS: readonly BuiltInUnit[] = [
  "year",
  "quarter",
  "month",
  "week",
  "day",
  "hour",
  "minute",
  "second",
];

const DIVISIONS: readonly (readonly [BuiltInUnit, BuiltInUnit])[] = [
  ["year", "quarter"],
  ["year", "month"],
  ["month", "week"],
  ["month", "day"],
  ["week", "day"],
  ["day", "hour"],
  ["hour", "minute"],
];

const DATES: readonly TimeValue[] = [
  zoned("2024-01-01T00:00:00[Europe/Zurich]"),
  zoned("2024-02-29T12:34:56.789[Europe/Zurich]"),
  zoned("2024-03-31T02:30:00[Europe/Zurich]"),
  zoned("2024-10-27T02:30:00[Europe/Zurich]"),
  zoned("2024-12-31T23:59:59.999[Europe/Zurich]"),
  zoned("2025-06-15T08:00:00[Europe/Zurich]"),
];

const BACK_A_YEAR_OF_MONTHS = -13;
const BACK_ONE = -1;
const STAY = 0;
const FORWARD_ONE = 1;
const FORWARD_A_WEEK = 7;
const FORWARD_A_YEAR_OF_WEEKS = 53;
const SHIFT_STEPS: readonly number[] = [
  BACK_A_YEAR_OF_MONTHS,
  BACK_ONE,
  STAY,
  FORWARD_ONE,
  FORWARD_A_WEEK,
  FORWARD_A_YEAR_OF_WEEKS,
];
const DIVIDE_STEP = 2;
const MONDAY = 1;

const INTERNAL_DETAILS: readonly string[] = [
  "assertValidDate",
  "bind",
  "createNativeAdapter",
  "derivePeriod",
  "divideWith",
  "go",
  "isSame",
  "periodWith",
];

const explicit = withUnits(createUnits());
const OWN: Readonly<Record<BuiltInUnit, (value: TimeValue) => Period>> = {
  day,
  hour,
  minute,
  month,
  quarter,
  second,
  week,
  year,
};

/**
 * Load a module namespace as a name → value map.
 *
 * @param namespace - Module namespace object from a dynamic import
 * @returns The exports keyed by name
 */
function exportsOf(namespace: object): ReadonlyMap<string, unknown> {
  return new Map<string, unknown>(Object.entries(namespace));
}

describe("export verification: index.ts", () => {
  it(
    "should not export internal implementation details",
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();
      const mainExports = exportsOf(await import("#src/index"));

      for (const internal of INTERNAL_DETAILS) {
        expect(mainExports.get(internal)).toBeUndefined();
      }
    }
  );

  it("should not have duplicate exports", { timeout: 5000 }, async () => {
    expect.hasAssertions();
    const exportNames = Object.keys(await import("#src/index"));
    const uniqueNames = [...new Set(exportNames)];
    expect(exportNames).toHaveLength(uniqueNames.length);
  });
});

describe("default entry vs withUnits(createUnits()): unit periods", () => {
  it("year() … second() give the same periods", { timeout: 5000 }, () => {
    expect.hasAssertions();
    for (const date of DATES) {
      for (const unit of UNITS) {
        expect(OWN[unit](date)).toStrictEqual(explicit[unit](date));
      }
    }
  });

  it("weeks start on Monday", { timeout: 5000 }, () => {
    expect.hasAssertions();
    for (const date of DATES) {
      expect(week(date).start.dayOfWeek).toBe(MONDAY);
      expect(explicit.week(date).start.dayOfWeek).toBe(MONDAY);
    }
  });
});

describe("default entry vs withUnits(createUnits()): navigation", () => {
  it("next() and previous() give the same periods", { timeout: 5000 }, () => {
    expect.hasAssertions();
    for (const date of DATES) {
      for (const unit of UNITS) {
        const current = explicit[unit](date);
        expect(defaultNext(current)).toStrictEqual(explicit.next(current));
        expect(previous(current)).toStrictEqual(explicit.previous(current));
      }
    }
  });

  it("shift() gives the same periods", { timeout: 5000 }, () => {
    expect.hasAssertions();
    for (const date of DATES) {
      for (const unit of UNITS) {
        const current = explicit[unit](date);
        for (const steps of SHIFT_STEPS) {
          expect(shift(current, steps)).toStrictEqual(
            explicit.shift(current, steps)
          );
        }
      }
    }
  });
});

describe("default entry vs withUnits(createUnits()): divide()", () => {
  it("divide() gives the same periods", { timeout: 5000 }, () => {
    expect.hasAssertions();
    for (const date of DATES) {
      for (const [parentUnit, childUnit] of DIVISIONS) {
        const parent = explicit[parentUnit](date);
        expect(divide(parent, childUnit)).toStrictEqual(
          explicit.divide(parent, childUnit)
        );
        expect(divide(parent, childUnit, { step: DIVIDE_STEP })).toStrictEqual(
          explicit.divide(parent, childUnit, { step: DIVIDE_STEP })
        );
      }
    }
  });
});

describe("default entry vs withUnits(createUnits()): comparisons", () => {
  it("same() gives the same answers", { timeout: 5000 }, () => {
    expect.hasAssertions();
    for (const firstDate of DATES) {
      const left = explicit.minute(firstDate);
      for (const secondDate of DATES) {
        const right = explicit.minute(secondDate);
        for (const unit of UNITS) {
          expect(same(left, right, unit)).toBe(
            explicit.same(left, right, unit)
          );
        }
      }
    }
  });
});

describe("export verification: index.ts against Minuta", () => {
  it(
    "has exactly the bound signatures of withUnits",
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();
      // A type error here means the default entry drifted from withUnits
      const bound: Omit<Minuta, "fortnight" | "units"> =
        await import("#src/index");
      expect(bound.period).toBe(period);
    }
  );
});
