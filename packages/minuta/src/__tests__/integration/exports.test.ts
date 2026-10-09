import {
  next as defaultNext,
  divide,
  period,
  previous,
  same,
  shift,
} from "#src/index";
import { describe, expect, it } from "vitest";
import type { Unit } from "#src/types";
import { nativeUnits } from "#src/native";
import { withUnits } from "#src/core";

const UNITS: readonly Unit[] = [
  "year",
  "quarter",
  "month",
  "week",
  "day",
  "hour",
  "minute",
  "second",
];

const DIVISIONS: readonly (readonly [Unit, Unit])[] = [
  ["year", "quarter"],
  ["year", "month"],
  ["month", "week"],
  ["month", "day"],
  ["week", "day"],
  ["day", "hour"],
  ["hour", "minute"],
];

const DATES: readonly Readonly<Date>[] = [
  new Date("2024-01-01T00:00:00"),
  new Date("2024-02-29T12:34:56.789"),
  new Date("2024-03-31T02:30:00"),
  new Date("2024-10-27T02:30:00"),
  new Date("2024-12-31T23:59:59.999"),
  new Date("2025-06-15T08:00:00"),
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

const UNIT_FREE_OPERATIONS: readonly string[] = [
  "contains",
  "length",
  "overlaps",
  "range",
];

const BOUND_OPERATIONS: readonly string[] = [
  "divide",
  "duration",
  "next",
  "period",
  "previous",
  "same",
  "shift",
];

const INTERNAL_DETAILS: readonly string[] = [
  "assertValidDate",
  "bind",
  "createNativeAdapter",
  "derivePeriod",
  "divideWith",
  "go",
  "isSame",
  "nativeUnits",
  "periodWith",
  "specFor",
  "withUnits",
];

const explicit = withUnits(nativeUnits());

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
    "should export exactly the operations plus MinutaError",
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();
      const mainExports = exportsOf(await import("#src/index"));
      const operations = [...BOUND_OPERATIONS, ...UNIT_FREE_OPERATIONS];

      expect(new Set(mainExports.keys())).toStrictEqual(
        new Set([...operations, "MinutaError"])
      );

      for (const op of operations) {
        expect(mainExports.get(op)).toBeTypeOf("function");
      }
    }
  );

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

describe("export verification: index.ts and core.ts", () => {
  it(
    "should share the unit-free operations with the core entry",
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();
      const mainExports = exportsOf(await import("#src/index"));
      const coreExports = exportsOf(await import("#src/core"));

      for (const op of [...UNIT_FREE_OPERATIONS, "MinutaError"]) {
        expect(mainExports.get(op)).toBe(coreExports.get(op));
      }
    }
  );
});

describe("default entry vs withUnits(nativeUnits()): period()", () => {
  it("period() gives the same periods", { timeout: 5000 }, () => {
    expect.hasAssertions();
    for (const date of DATES) {
      for (const unit of UNITS) {
        expect(period(date, unit)).toStrictEqual(explicit.period(date, unit));
      }
    }
  });

  it("weeks start on Monday", { timeout: 5000 }, () => {
    expect.hasAssertions();
    for (const date of DATES) {
      expect(period(date, "week").start.getDay()).toBe(MONDAY);
      expect(explicit.period(date, "week").start.getDay()).toBe(MONDAY);
    }
  });
});

describe("default entry vs withUnits(nativeUnits()): navigation", () => {
  it("next() and previous() give the same periods", { timeout: 5000 }, () => {
    expect.hasAssertions();
    for (const date of DATES) {
      for (const unit of UNITS) {
        const current = explicit.period(date, unit);
        expect(defaultNext(current)).toStrictEqual(explicit.next(current));
        expect(previous(current)).toStrictEqual(explicit.previous(current));
      }
    }
  });

  it("shift() gives the same periods", { timeout: 5000 }, () => {
    expect.hasAssertions();
    for (const date of DATES) {
      for (const unit of UNITS) {
        const current = explicit.period(date, unit);
        for (const steps of SHIFT_STEPS) {
          expect(shift(current, steps)).toStrictEqual(
            explicit.shift(current, steps)
          );
        }
      }
    }
  });
});

describe("default entry vs withUnits(nativeUnits()): divide()", () => {
  it("divide() gives the same periods", { timeout: 5000 }, () => {
    expect.hasAssertions();
    for (const date of DATES) {
      for (const [parentUnit, childUnit] of DIVISIONS) {
        const parent = explicit.period(date, parentUnit);
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

describe("default entry vs withUnits(nativeUnits()): comparisons", () => {
  it("same() gives the same answers", { timeout: 5000 }, () => {
    expect.hasAssertions();
    for (const firstDate of DATES) {
      const first = explicit.period(firstDate, "minute");
      for (const secondDate of DATES) {
        const second = explicit.period(secondDate, "minute");
        for (const unit of UNITS) {
          expect(same(first, second, unit)).toBe(
            explicit.same(first, second, unit)
          );
        }
      }
    }
  });
});
