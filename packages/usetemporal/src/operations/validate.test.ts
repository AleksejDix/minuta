import { describe, it, expect } from "vitest";
import { divide } from "./divide";
import { split } from "./split";
import { merge } from "./merge";
import { derivePeriod as period } from "./period";
import { createNativeAdapter } from "../adapters/native";
import type { Period } from "../types";

const adapter = createNativeAdapter();

describe("input validation", () => {
  describe("Invalid Date (NaN)", () => {
    const invalidPeriod: Period = {
      start: new Date("invalid"),
      end: new Date("also-invalid"),
      type: "day",
    };

    it("divide() should throw on invalid date", () => {
      expect(() => divide(adapter, invalidPeriod, "hour")).toThrow(
        "Period contains invalid date"
      );
    });

    it("split() should throw on invalid date", () => {
      expect(() => split(invalidPeriod, new Date())).toThrow(
        "Period contains invalid date"
      );
    });

    it("merge() should throw on invalid date", () => {
      expect(() => merge(adapter, [invalidPeriod])).toThrow(
        "Period contains invalid date"
      );
    });
  });

  describe("reversed periods (start > end)", () => {
    const reversed: Period = {
      start: new Date(2024, 5, 15),
      end: new Date(2024, 0, 1),
      type: "day",
    };

    it("divide() should throw on reversed period", () => {
      expect(() => divide(adapter, reversed, "hour")).toThrow(
        "Period start must be before or equal to end"
      );
    });

    it("split() should throw on reversed period", () => {
      expect(() => split(reversed, new Date(2024, 2, 1))).toThrow(
        "Period start must be before or equal to end"
      );
    });

    it("merge() should throw on reversed period", () => {
      expect(() => merge(adapter, [reversed])).toThrow(
        "Period start must be before or equal to end"
      );
    });
  });

  describe("zero-duration periods are valid", () => {
    it("divide() should accept start === end", () => {
      const point = period(adapter, new Date(2024, 0, 15), "day");
      const zeroDuration: Period = {
        start: point.start,
        end: point.start,
        type: "day",
      };
      expect(() => divide(adapter, zeroDuration, "hour")).not.toThrow();
    });
  });
});
