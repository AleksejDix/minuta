import { describe, expect, it } from "vitest";
import type { AllUnits } from "#src/types";
import { dateFnsTzUnits } from "#src/date-fns-tz";
import { dateFnsUnits } from "#src/date-fns";
import { dayjsUnits } from "#src/dayjs";
import { luxonUnits } from "#src/luxon";
import { momentUnits } from "#src/moment";
import { nativeUnits } from "#src/native";
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
  ["native", "nativeUnits", nativeUnits],
  ["temporal", "temporalUnits", temporalUnits],
  ["luxon", "luxonUnits", luxonUnits],
  ["dayjs", "dayjsUnits", dayjsUnits],
  ["date-fns", "dateFnsUnits", dateFnsUnits],
  ["date-fns-tz", "dateFnsTzUnits", dateFnsTzUnits],
  ["moment", "momentUnits", momentUnits],
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

describe("export verification: adapter entries", () => {
  it.each(ADAPTER_ENTRIES)(
    "%s entry should export only %s",
    { timeout: 5000 },
    async (entry: string, factoryName: string, factory: () => AllUnits) => {
      expect.hasAssertions();
      const namespace: unknown = await import(`#src/${entry}`);
      const entryExports = exportsOf(namespace);
      expect([...entryExports.keys()]).toStrictEqual([factoryName]);
      expect(entryExports.get(factoryName)).toBe(factory);
    }
  );

  it.each(ADAPTER_ENTRIES)(
    "%s entry: %s() should return every unit",
    { timeout: 5000 },
    (_entry: string, _factoryName: string, factory: () => AllUnits) => {
      expect.hasAssertions();
      const unitNames = new Set(
        Object.keys(factory()).filter((name) => name !== "weekend")
      );
      expect(unitNames).toStrictEqual(new Set(UNIT_NAMES));
    }
  );
});
