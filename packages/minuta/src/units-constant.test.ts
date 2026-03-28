import { describe, it, expect } from "vitest";
import { UNITS, type Unit, type UnitsObject } from "./types";

describe("UNITS constant", () => {
  it("should contain all core units", () => {
    // Verify all expected units are present
    expect(UNITS.year).toBe("year");
    expect(UNITS.quarter).toBe("quarter");
    expect(UNITS.month).toBe("month");
    expect(UNITS.week).toBe("week");
    expect(UNITS.day).toBe("day");
    expect(UNITS.hour).toBe("hour");
    expect(UNITS.minute).toBe("minute");
    expect(UNITS.second).toBe("second");
    expect(UNITS.custom).toBe("custom");

    // Verify the object has exactly these keys
    const expectedKeys = [
      "year",
      "quarter",
      "month",
      "week",
      "day",
      "hour",
      "minute",
      "second",
      "custom",
    ];
    expect(Object.keys(UNITS).sort()).toEqual(expectedKeys.sort());
  });

  it("should be immutable", () => {
    // Test that the object itself is frozen
    expect(Object.isFrozen(UNITS)).toBe(true);

    // Test runtime immutability - trying to modify should throw
    expect(() => {
      // @ts-expect-error - testing runtime immutability
      UNITS.year = "invalid";
    }).toThrow();

    expect(() => {
      // @ts-expect-error - testing runtime immutability
      UNITS.newUnit = "invalid";
    }).toThrow();

    expect(() => {
      // @ts-expect-error - testing runtime immutability
      delete UNITS.year;
    }).toThrow();
  });

  it("should work with type guards", () => {
    const isValidUnit = (unit: string): unit is Unit => {
      return Object.values(UNITS).includes(unit as any);
    };

    // Valid units
    expect(isValidUnit("year")).toBe(true);
    expect(isValidUnit("month")).toBe(true);
    expect(isValidUnit("week")).toBe(true);
    expect(isValidUnit("day")).toBe(true);
    expect(isValidUnit("hour")).toBe(true);
    expect(isValidUnit("minute")).toBe(true);
    expect(isValidUnit("second")).toBe(true);
    expect(isValidUnit("quarter")).toBe(true);
    expect(isValidUnit("custom")).toBe(true);

    // Invalid units
    expect(isValidUnit("invalid")).toBe(false);
    expect(isValidUnit("years")).toBe(false);
    expect(isValidUnit("")).toBe(false);
  });

  it("should work with iteration", () => {
    // Test Object.values iteration
    const unitValues = Object.values(UNITS);
    expect(unitValues).toHaveLength(9);
    expect(unitValues).toContain("year");
    expect(unitValues).toContain("second");

    // Test mapping over values
    const upperUnits = Object.values(UNITS).map((unit) => unit.toUpperCase());
    expect(upperUnits).toContain("YEAR");
    expect(upperUnits).toContain("SECOND");
    expect(upperUnits).toContain("CUSTOM");

    // Test Object.entries iteration
    const entries = Object.entries(UNITS);
    expect(entries).toHaveLength(9);
    expect(entries[0]).toEqual(["year", "year"]);
  });

  it("should work with unit validation in real scenarios", () => {
    // Simulate dropdown validation
    const dropdownOptions = Object.values(UNITS);
    expect(dropdownOptions).toHaveLength(9);

    // Simulate unit validation function
    const validateUnit = (input: unknown): input is Unit => {
      return (
        typeof input === "string" && Object.values(UNITS).includes(input as any)
      );
    };

    expect(validateUnit("month")).toBe(true);
    expect(validateUnit("invalid")).toBe(false);
    expect(validateUnit(123)).toBe(false);
    expect(validateUnit(null)).toBe(false);
  });

  it("should have proper TypeScript types", () => {
    // Type tests - these compile-time checks ensure proper typing
    const testUnit: Unit = UNITS.year;
    expect(testUnit).toBe("year");

    // Test that UNITS values can be assigned to Unit type
    const unitFromObject: Unit = UNITS.month;
    expect(unitFromObject).toBe("month");

    // Test UnitsObject type
    const unitsObj: UnitsObject = UNITS;
    expect(unitsObj).toBe(UNITS);

    // Test that all keys are valid units
    type UnitsKeys = keyof typeof UNITS;
    const key: UnitsKeys = "day";
    expect(UNITS[key]).toBe("day");
  });

  it("should maintain consistency between keys and values", () => {
    // Each key should equal its value (important for the object pattern)
    Object.entries(UNITS).forEach(([key, value]) => {
      expect(key).toBe(value);
    });
  });

  it("should support destructuring", () => {
    const { year, month, day } = UNITS;
    expect(year).toBe("year");
    expect(month).toBe("month");
    expect(day).toBe("day");
  });

  it("should work with switch statements", () => {
    const getUnitLabel = (unit: Unit): string => {
      switch (unit) {
        case UNITS.year:
          return "Year";
        case UNITS.month:
          return "Month";
        case UNITS.week:
          return "Week";
        case UNITS.day:
          return "Day";
        case UNITS.hour:
          return "Hour";
        case UNITS.minute:
          return "Minute";
        case UNITS.second:
          return "Second";
        case UNITS.quarter:
          return "Quarter";
        case UNITS.custom:
          return "Custom";
        default:
          return "Unknown";
      }
    };

    expect(getUnitLabel("year")).toBe("Year");
    expect(getUnitLabel("month")).toBe("Month");
    expect(getUnitLabel("custom")).toBe("Custom");
  });

  it("should be useful for autocomplete scenarios", () => {
    // The object pattern provides better autocomplete than array
    const selectedUnit = UNITS.month; // This gives autocomplete
    expect(selectedUnit).toBe("month");

    // Can be used in function calls with autocomplete
    const mockDivide = (unit: Unit) => unit;
    expect(mockDivide(UNITS.day)).toBe("day");
  });
});
