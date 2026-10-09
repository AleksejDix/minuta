import { describe, expect, it } from "vitest";
import { divideWith } from "./divide";
import { getUnitsTestCases } from "#src/test/shared-adapter-tests";
import { mergeWith } from "./merge";
import { periodWith as period } from "./period";

const adapters = getUnitsTestCases();

describe.each(adapters)(
  "merge() aligned results with %s adapter",
  (_name, units) => {
    it("keeps a single period's own unit", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const day = period(units, new Date("2024-01-15T00:00:00"), "day");
      expect(mergeWith(units, [day])).toHaveProperty("unit", "day");
    });

    it("promotes 3 months to the quarter they fill", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const quarter = period(units, new Date("2024-02-15T00:00:00"), "quarter");
      const months = divideWith(units, quarter, "month");
      expect(mergeWith(units, months, "quarter")).toHaveProperty(
        "unit",
        "quarter"
      );
    });

    it("keeps no unit for the wrong quarter", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const months = [
        period(units, new Date("2024-02-15T00:00:00"), "month"),
        period(units, new Date("2024-03-15T00:00:00"), "month"),
        period(units, new Date("2024-04-15T00:00:00"), "month"),
      ];
      expect(mergeWith(units, months, "quarter")).toHaveProperty(
        "unit",
        "custom"
      );
    });
  }
);
