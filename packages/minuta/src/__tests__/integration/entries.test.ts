import { createUnits, withUnits } from "#src/index";
import { describe, expect, it } from "vitest";
import type { TimeValue } from "#src/types";
import { readFile } from "node:fs/promises";
import { zoned } from "#src/test/temporal";

// Every function: the main entry's exports and the members of withUnits
const FUNCTIONS: readonly string[] = [
  "clamp",
  "compare",
  "contains",
  "count",
  "day",
  "dayGrid",
  "divide",
  "equals",
  "gap",
  "hour",
  "isWeekday",
  "isWeekend",
  "merge",
  "minute",
  "month",
  "monthGrid",
  "next",
  "overlaps",
  "period",
  "previous",
  "quarter",
  "round",
  "second",
  "shift",
  "toLocaleString",
  "week",
  "year",
  "yearGrid",
];

const SETUP: readonly string[] = ["MinutaError", "createUnits", "withUnits"];

const REMOVED_ENTRIES: readonly string[] = [
  "calendar",
  "core",
  "format",
  "intervals",
];

const MANIFEST = new URL("../../../package.json", import.meta.url);

// The subpaths a package.json exports
function subpathsOf(manifest: unknown): string[] {
  if (
    typeof manifest !== "object" ||
    manifest === null ||
    !("exports" in manifest) ||
    typeof manifest.exports !== "object" ||
    manifest.exports === null
  ) {
    throw new TypeError("Expected a package.json with exports");
  }
  return Object.keys(manifest.exports);
}

const GRID_DATES: readonly TimeValue[] = [
  zoned("2024-01-01T00:00:00[Europe/Zurich]"),
  zoned("2024-03-31T12:00:00[Europe/Zurich]"),
  zoned("2024-12-31T23:59:59.999[Europe/Zurich]"),
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

describe("entries", () => {
  it(
    "are the main entry and minuta/temporal only",
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();
      const manifest: unknown = JSON.parse(await readFile(MANIFEST, "utf8"));
      expect(subpathsOf(manifest)).toStrictEqual([".", "./temporal"]);
    }
  );

  it.each(REMOVED_ENTRIES)(
    "minuta/%s is gone",
    { timeout: 5000 },
    async (entry: string) => {
      expect.hasAssertions();
      await expect(import(`#src/${entry}`)).rejects.toThrow(entry);
    }
  );
});

describe("the main entry", () => {
  it("exports every function and the setup", { timeout: 5000 }, async () => {
    expect.hasAssertions();
    const entry = exportsOf(await import("#src/index"));
    expect(new Set(entry.keys())).toStrictEqual(
      new Set([...FUNCTIONS, ...SETUP])
    );
  });

  it(
    "has the same functions as withUnits, plus its units",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const bound = withUnits(createUnits());
      expect(new Set(Object.keys(bound))).toStrictEqual(
        new Set([...FUNCTIONS, "units"])
      );
    }
  );

  it(
    "gives the same grids as withUnits(createUnits())",
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();
      const entry = await import("#src/index");
      const bound = withUnits(createUnits());

      for (const date of GRID_DATES) {
        expect(entry.monthGrid(date)).toStrictEqual(bound.monthGrid(date));
        expect(entry.yearGrid(date)).toStrictEqual(bound.yearGrid(date));
        expect(entry.dayGrid(date)).toStrictEqual(bound.dayGrid(date));
      }
    }
  );
});
