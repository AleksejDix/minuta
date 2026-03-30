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

    it("should export all expected operation functions", () => {
      const expectedOperations = [
        "clamp",
        "contains",
        "derivePeriod",
        "createPeriod",
        "divide",
        "duration",
        "go",
        "isSame",
        "merge",
        "next",
        "previous",
        "resize",
        "split",
      ];

      expectedOperations.forEach((op) => {
        expect((operationsExports as Record<string, any>)[op]).toBeDefined();
        expect(typeof (operationsExports as Record<string, any>)[op]).toBe(
          "function"
        );
      });
    });
  });

  describe("index.ts exports", () => {
    it("should export all operation functions", () => {
      const expectedOperations = [
        "divide",
        "next",
        "previous",
        "go",
        "contains",
        "derivePeriod",
        "createPeriod",
        "split",
        "merge",
        "isSame",
        "gap",
        "clamp",
        "duration",
        "resize",
      ];

      expectedOperations.forEach((op) => {
        expect((mainExports as Record<string, any>)[op]).toBeDefined();
        expect(typeof (mainExports as Record<string, any>)[op]).toBe(
          "function"
        );
        expect((mainExports as Record<string, any>)[op]).toBe(
          (operationsExports as Record<string, any>)[op]
        );
      });
    });

    // Helpers (isWeekend, isWeekday, isToday) are in minuta/helpers

    it("should export unit constants", () => {
      expect(mainExports.UNITS).toBeDefined();
      expect(mainExports.UNITS.year).toBe("year");
      expect(mainExports.UNITS.quarter).toBe("quarter");
      expect(mainExports.UNITS.month).toBe("month");
      expect(mainExports.UNITS.week).toBe("week");
      expect(mainExports.UNITS.day).toBe("day");
      expect(mainExports.UNITS.hour).toBe("hour");
      expect(mainExports.UNITS.minute).toBe("minute");
      expect(mainExports.UNITS.second).toBe("second");
      expect(mainExports.UNITS.custom).toBe("custom");

      const expectedUnits = [
        "YEAR",
        "QUARTER",
        "MONTH",
        "WEEK",
        "DAY",
        "HOUR",
        "MINUTE",
        "SECOND",
        "CUSTOM",
      ];

      expectedUnits.forEach((unit) => {
        expect((mainExports as Record<string, any>)[unit]).toBeDefined();
        expect(typeof (mainExports as Record<string, any>)[unit]).toBe(
          "string"
        );
      });
    });

    it("should not export internal implementation details", () => {
      const internalDetails = [
        "isAdapterUnit",
        "isLeapYear",
        "createNativeAdapter",
        "mockAdapter",
      ];

      internalDetails.forEach((internal) => {
        expect((mainExports as Record<string, any>)[internal]).toBeUndefined();
      });
    });

    it("should have consistent exports between operations and main", () => {
      const operationNames = [
        "divide",
        "next",
        "previous",
        "go",
        "contains",
        "derivePeriod",
        "createPeriod",
        "split",
        "merge",
        "isSame",
        "gap",
        "clamp",
        "duration",
        "resize",
      ];

      operationNames.forEach((op) => {
        expect((mainExports as Record<string, any>)[op]).toBe(
          (operationsExports as Record<string, any>)[op]
        );
      });
    });
  });

  describe("TypeScript type exports", () => {
    it("should have all expected type exports in main index", () => {
      const exportedNames = Object.keys(mainExports);

      const typeRelatedExports = ["UNITS", "derivePeriod"];

      typeRelatedExports.forEach((name) => {
        expect(exportedNames).toContain(name);
      });
    });
  });

  describe("Export completeness", () => {
    it("should export a complete API surface", () => {
      const coreExports = Object.keys(mainExports);

      const minimumExports = [
        "divide",
        "next",
        "previous",
        "go",
        "contains",
        "derivePeriod",
        "createPeriod",
        "split",
        "merge",
        "isSame",
        "UNITS",
        "YEAR",
        "QUARTER",
        "MONTH",
        "WEEK",
        "DAY",
        "HOUR",
        "MINUTE",
        "SECOND",
        "CUSTOM",
      ];

      minimumExports.forEach((exportName) => {
        expect(coreExports).toContain(exportName);
      });

      expect(coreExports.length).toBeGreaterThanOrEqual(minimumExports.length);
    });

    it("should not have duplicate exports", () => {
      const exportNames = Object.keys(mainExports);
      const uniqueNames = [...new Set(exportNames)];
      expect(exportNames.length).toBe(uniqueNames.length);
    });
  });

  describe("Performance", () => {
    it("should complete all export tests in under 100ms", () => {
      const start = performance.now();

      Object.keys(mainExports).forEach((key) => {
        const value = (mainExports as Record<string, any>)[key];
        if (typeof value === "function") {
          expect(value).toBeDefined();
        }
      });

      Object.keys(operationsExports).forEach((key) => {
        const value = (operationsExports as Record<string, any>)[key];
        if (typeof value === "function") {
          expect(value).toBeDefined();
        }
      });

      const duration = performance.now() - start;
      expect(duration).toBeLessThan(100);
    });
  });
});
