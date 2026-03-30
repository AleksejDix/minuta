import { describe, it, expect } from "vitest";
import * as mainExports from "../../index";
import * as operationsExports from "../../operations";
import * as operationsIndex from "../../operations/index";

describe("Export Verification Tests", () => {
  describe("operations.ts exports", () => {
    it("should re-export all operations from operations/index.ts", () => {
      const operationsKeys = Object.keys(operationsExports).sort();
      const operationsIndexKeys = Object.keys(operationsIndex).sort();

      expect(operationsKeys).toEqual(operationsIndexKeys);

      operationsKeys.forEach((key) => {
        expect((operationsExports as Record<string, any>)[key]).toBe(
          (operationsIndex as Record<string, any>)[key]
        );
      });
    });
  });

  describe("index.ts exports", () => {
    it("should export all operation functions", () => {
      const expectedOperations = [
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

      expectedOperations.forEach((op) => {
        expect((mainExports as Record<string, any>)[op]).toBeDefined();
        expect(typeof (mainExports as Record<string, any>)[op]).toBe(
          "function"
        );
      });
    });

    it("should not export internal implementation details", () => {
      const internalDetails = [
        "isAdapterUnit",
        "isLeapYear",
        "createNativeAdapter",
        "mockAdapter",
        "UNITS",
        "YEAR",
        "UnitHandler",
      ];

      internalDetails.forEach((internal) => {
        expect((mainExports as Record<string, any>)[internal]).toBeUndefined();
      });
    });

    it("should not have duplicate exports", () => {
      const exportNames = Object.keys(mainExports);
      const uniqueNames = [...new Set(exportNames)];
      expect(exportNames.length).toBe(uniqueNames.length);
    });
  });
});
