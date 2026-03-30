import { describe, it, expect } from "vitest";
import { snap } from "./snap";

const MIN = 60_000;

describe("snap", () => {
  describe("nearest (default)", () => {
    it("snaps to nearest 15min boundary", () => {
      const result = snap(new Date("2024-03-15T10:37:00Z"), 15 * MIN);
      expect(result).toEqual(new Date("2024-03-15T10:30:00Z"));
    });

    it("snaps up when closer to next boundary", () => {
      const result = snap(new Date("2024-03-15T10:38:00Z"), 15 * MIN);
      expect(result).toEqual(new Date("2024-03-15T10:45:00Z"));
    });

    it("already on boundary", () => {
      const result = snap(new Date("2024-03-15T10:00:00Z"), 15 * MIN);
      expect(result).toEqual(new Date("2024-03-15T10:00:00Z"));
    });

    it("snaps to nearest 30min", () => {
      const result = snap(new Date("2024-03-15T10:37:00Z"), 30 * MIN);
      expect(result).toEqual(new Date("2024-03-15T10:30:00Z"));
    });

    it("snaps to nearest 5min", () => {
      const result = snap(new Date("2024-03-15T14:02:00Z"), 5 * MIN);
      expect(result).toEqual(new Date("2024-03-15T14:00:00Z"));
    });

    it("snaps across midnight", () => {
      const result = snap(new Date("2024-03-15T23:53:00Z"), 15 * MIN);
      expect(result).toEqual(new Date("2024-03-16T00:00:00Z"));
    });
  });

  describe("floor", () => {
    it("always snaps to earlier boundary", () => {
      const result = snap(new Date("2024-03-15T10:37:00Z"), 15 * MIN, "floor");
      expect(result).toEqual(new Date("2024-03-15T10:30:00Z"));
    });

    it("stays on boundary", () => {
      const result = snap(new Date("2024-03-15T10:45:00Z"), 15 * MIN, "floor");
      expect(result).toEqual(new Date("2024-03-15T10:45:00Z"));
    });

    it("floors to 30min", () => {
      const result = snap(new Date("2024-03-15T10:59:00Z"), 30 * MIN, "floor");
      expect(result).toEqual(new Date("2024-03-15T10:30:00Z"));
    });
  });

  describe("ceil", () => {
    it("always snaps to later boundary", () => {
      const result = snap(new Date("2024-03-15T10:31:00Z"), 15 * MIN, "ceil");
      expect(result).toEqual(new Date("2024-03-15T10:45:00Z"));
    });

    it("stays on boundary", () => {
      const result = snap(new Date("2024-03-15T10:30:00Z"), 15 * MIN, "ceil");
      expect(result).toEqual(new Date("2024-03-15T10:30:00Z"));
    });

    it("ceils across midnight", () => {
      const result = snap(new Date("2024-03-15T23:46:00Z"), 15 * MIN, "ceil");
      expect(result).toEqual(new Date("2024-03-16T00:00:00Z"));
    });
  });

  describe("1-hour intervals", () => {
    const HOUR = 60 * MIN;

    it("snaps to nearest hour", () => {
      const result = snap(new Date("2024-03-15T10:29:00Z"), HOUR);
      expect(result).toEqual(new Date("2024-03-15T10:00:00Z"));
    });

    it("snaps up past half hour", () => {
      const result = snap(new Date("2024-03-15T10:31:00Z"), HOUR);
      expect(result).toEqual(new Date("2024-03-15T11:00:00Z"));
    });
  });
});
