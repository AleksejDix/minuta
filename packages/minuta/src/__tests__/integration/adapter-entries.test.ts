import { describe, expect, it } from "vitest";
import type { AllUnits } from "#src/types";
import { dateFnsTzUnits } from "#src/date-fns-tz";
import { temporalUnits } from "#src/temporal";

const UNIT_NAMES: readonly string[] = [
  "day",
  "hour",
  "minute",
  "month",
  "quarter",
  "second",
  "week",
  "year",
];

type AdapterEntry = readonly [string, string, () => AllUnits];

const ADAPTER_ENTRIES: readonly AdapterEntry[] = [
  ["temporal", "temporalUnits", temporalUnits],
  ["date-fns-tz", "dateFnsTzUnits", dateFnsTzUnits],
];

// Exports an entry has besides its factory
const EXTRA_EXPORTS: ReadonlyMap<string, readonly string[]> = new Map([
  ["temporal", ["temporalReady"]],
]);

/**
 * Every name an entry should export.
 *
 * @param entry - The entry's file name
 * @param factoryName - The name of its units factory
 * @returns The factory's name and the entry's other exports
 */
function expectedExports(
  entry: string,
  factoryName: string
): ReadonlySet<string> {
  return new Set([factoryName, ...(EXTRA_EXPORTS.get(entry) ?? [])]);
}

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

// Keys of the units that are settings, not unit specs
const SETTINGS: ReadonlySet<string> = new Set([
  "timeZone",
  "weekStartsOn",
  "weekend",
]);

describe("export verification: adapter entries", () => {
  it.each(ADAPTER_ENTRIES)(
    "%s entry should export %s and nothing else of its own",
    { timeout: 5000 },
    async (entry: string, factoryName: string, factory: () => AllUnits) => {
      expect.hasAssertions();
      const namespace: unknown = await import(`#src/${entry}`);
      const entryExports = exportsOf(namespace);
      expect(new Set(entryExports.keys())).toStrictEqual(
        expectedExports(entry, factoryName)
      );
      expect(entryExports.get(factoryName)).toBe(factory);
    }
  );

  it.each(ADAPTER_ENTRIES)(
    "%s entry: %s() should return every unit",
    { timeout: 5000 },
    (_entry: string, _factoryName: string, factory: () => AllUnits) => {
      expect.hasAssertions();
      const unitNames = new Set(
        Object.keys(factory()).filter((name) => !SETTINGS.has(name))
      );
      expect(unitNames).toStrictEqual(new Set(UNIT_NAMES));
    }
  );
});
