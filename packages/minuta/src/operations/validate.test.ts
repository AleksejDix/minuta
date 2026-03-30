import { describe, it, expect } from "vitest";
import { createPeriod, derivePeriod } from "./period";
import { createNativeAdapter } from "../adapters/native";

const adapter = createNativeAdapter();

describe("input validation", () => {
  describe("createPeriod rejects invalid input", () => {
    it("throws on invalid dates", () => {
      expect(() =>
        createPeriod(new Date("invalid"), new Date("also-invalid"))
      ).toThrow("Period contains invalid date");
    });

    it("throws on reversed period (start > end)", () => {
      expect(() =>
        createPeriod(new Date(2024, 5, 15), new Date(2024, 0, 1))
      ).toThrow("must be before or equal to end");
    });

    it("accepts zero-duration period (start === end)", () => {
      expect(() =>
        createPeriod(new Date(2024, 0, 1), new Date(2024, 0, 1))
      ).not.toThrow();
    });
  });

  describe("derivePeriod always produces valid periods", () => {
    it("produces valid period from any date", () => {
      const p = derivePeriod(adapter, new Date(2024, 0, 15), "month");
      expect(p.start.getTime()).toBeLessThanOrEqual(p.end.getTime());
      expect(isNaN(p.start.getTime())).toBe(false);
    });
  });
});
