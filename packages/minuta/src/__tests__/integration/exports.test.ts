import { describe, expect, it } from "vitest";

const EXPECTED_OPERATIONS: readonly string[] = [
  "clamp",
  "contains",
  "createPeriod",
  "derivePeriod",
  "divide",
  "duration",
  "gap",
  "go",
  "isSame",
  "merge",
  "move",
  "next",
  "previous",
  "resize",
  "split",
];

const INTERNAL_DETAILS: readonly string[] = [
  "isAdapterUnit",
  "isLeapYear",
  "createNativeAdapter",
  "mockAdapter",
  "UNITS",
  "YEAR",
  "UnitHandler",
];

/**
 * Load a module namespace as a name → value map.
 *
 * @param namespace - Module namespace object from a dynamic import
 * @returns The exports keyed by name
 */
function exportsOf(namespace: object): ReadonlyMap<string, unknown> {
  return new Map<string, unknown>(Object.entries(namespace));
}

describe("export verification: operations.ts", () => {
  it(
    "should re-export all operations from operations/index.ts",
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();
      const operationsExports = exportsOf(await import("#src/operations"));
      const operationsIndex = exportsOf(await import("#src/operations/index"));

      expect(new Set(operationsExports.keys())).toStrictEqual(
        new Set(operationsIndex.keys())
      );

      for (const [key, value] of operationsExports) {
        expect(value).toBe(operationsIndex.get(key));
      }
    }
  );
});

describe("export verification: index.ts", () => {
  it("should export all operation functions", { timeout: 5000 }, async () => {
    expect.hasAssertions();
    const mainExports = exportsOf(await import("#src/index"));

    for (const op of EXPECTED_OPERATIONS) {
      expect(mainExports.get(op)).toBeDefined();
      expect(mainExports.get(op)).toBeTypeOf("function");
    }
  });

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
