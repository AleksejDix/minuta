import {
  calendar,
  dayGridWith,
  monthGridWith,
  yearGridWith,
} from "#src/calendar";
import { describe, expect, it } from "vitest";
import { bind } from "#src/core";
import { nativeUnits } from "#src/native";

const UNIT_FREE_OPERATIONS: readonly string[] = [
  "contains",
  "length",
  "overlaps",
  "range",
];

const CORE_OPERATIONS: readonly string[] = [
  "divideWith",
  "durationWith",
  "nextWith",
  "periodWith",
  "previousWith",
  "sameWith",
  "shiftWith",
];

const INTERVAL_EXPORTS: readonly string[] = [
  "clamp",
  "gap",
  "intervals",
  "mergeWith",
  "move",
  "resize",
  "snapWith",
  "split",
];

const REMOVED_ENTRIES: readonly string[] = ["operations", "helpers"];

const GRID_DATES: readonly Readonly<Date>[] = [
  new Date("2024-01-01T00:00:00"),
  new Date("2024-03-31T12:00:00"),
  new Date("2024-12-31T23:59:59.999"),
];

/**
 * Load a module namespace as a name → value map.
 *
 * @param namespace - Module namespace object from a dynamic import
 * @returns The exports keyed by name
 */
function exportsOf(namespace: unknown): ReadonlyMap<string, unknown> {
  if (typeof namespace !== "object" || namespace === null) {
    throw new TypeError("Expected a module namespace");
  }
  return new Map<string, unknown>(Object.entries(namespace));
}

describe("export verification: core.ts", () => {
  it(
    "should export the context-first operations and binders",
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();
      const coreExports = exportsOf(await import("#src/core"));
      expect(new Set(coreExports.keys())).toStrictEqual(
        new Set([
          ...CORE_OPERATIONS,
          ...UNIT_FREE_OPERATIONS,
          "MinutaError",
          "bind",
          "specFor",
          "withUnits",
        ])
      );
    }
  );

  it(
    "should re-export every operation unchanged from core, intervals or calendar",
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();
      const entries = [
        exportsOf(await import("#src/core")),
        exportsOf(await import("#src/intervals")),
        exportsOf(await import("#src/calendar")),
      ];
      const operationsIndex = exportsOf(await import("#src/operations/index"));

      for (const [key, value] of operationsIndex) {
        expect(entries.map((entry) => entry.get(key))).toContain(value);
      }
    }
  );
});

describe("export verification: intervals.ts", () => {
  it(
    "should export the intervals plugin and its functions",
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();
      const intervalExports = exportsOf(await import("#src/intervals"));
      expect(new Set(intervalExports.keys())).toStrictEqual(
        new Set(INTERVAL_EXPORTS)
      );
    }
  );
});

describe("export verification: removed entries", () => {
  it.each(REMOVED_ENTRIES)(
    "minuta/%s should no longer exist",
    { timeout: 5000 },
    async (entry: string) => {
      expect.hasAssertions();
      await expect(import(`#src/${entry}`)).rejects.toThrow(entry);
    }
  );
});

describe("export verification: calendar.ts", () => {
  it(
    "should export the calendar plugin and the grid functions",
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();
      const calendarExports = exportsOf(await import("#src/calendar"));
      expect(new Set(calendarExports.keys())).toStrictEqual(
        new Set([
          "calendar",
          "dayGridWith",
          "isWeekdayWith",
          "isWeekendWith",
          "monthGridWith",
          "yearGridWith",
        ])
      );
    }
  );

  it(
    "should give the same grids through bind(units, calendar)",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const units = nativeUnits({ weekStartsOn: 0 });
      const grids = bind(units, calendar);

      for (const date of GRID_DATES) {
        expect(grids.monthGrid(date)).toStrictEqual(monthGridWith(units, date));
        expect(grids.yearGrid(date)).toStrictEqual(yearGridWith(units, date));
        expect(grids.dayGrid(date)).toStrictEqual(dayGridWith(units, date));
      }
    }
  );
});

describe("export verification: format.ts", () => {
  it("should export the formatting functions", { timeout: 5000 }, async () => {
    expect.hasAssertions();
    const formatExports = exportsOf(await import("#src/format"));
    expect(new Set(formatExports.keys())).toStrictEqual(
      new Set(["formatPeriod", "formatRange"])
    );
  });
});
