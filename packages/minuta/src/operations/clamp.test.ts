import { describe, it, expect } from "vitest";
import { clamp } from "./clamp";
import { createPeriod } from "./period";

describe("clamp", () => {
  const bounds = createPeriod(new Date(2024, 0, 10), new Date(2024, 0, 20));

  it("truncates period that extends past bounds", () => {
    const wide = createPeriod(new Date(2024, 0, 5), new Date(2024, 0, 25));
    const result = clamp(wide, bounds)!;
    expect(result.start).toEqual(new Date(2024, 0, 10));
    expect(result.end).toEqual(new Date(2024, 0, 20));
  });

  it("returns as-is when fully within bounds", () => {
    const inner = createPeriod(new Date(2024, 0, 12), new Date(2024, 0, 18));
    const result = clamp(inner, bounds)!;
    expect(result.start).toEqual(new Date(2024, 0, 12));
    expect(result.end).toEqual(new Date(2024, 0, 18));
  });

  it("truncates start only", () => {
    const earlyStart = createPeriod(
      new Date(2024, 0, 5),
      new Date(2024, 0, 15)
    );
    const result = clamp(earlyStart, bounds)!;
    expect(result.start).toEqual(new Date(2024, 0, 10));
    expect(result.end).toEqual(new Date(2024, 0, 15));
  });

  it("truncates end only", () => {
    const lateEnd = createPeriod(new Date(2024, 0, 15), new Date(2024, 0, 25));
    const result = clamp(lateEnd, bounds)!;
    expect(result.start).toEqual(new Date(2024, 0, 15));
    expect(result.end).toEqual(new Date(2024, 0, 20));
  });

  it("returns null when entirely outside bounds", () => {
    const before = createPeriod(new Date(2024, 0, 1), new Date(2024, 0, 5));
    expect(clamp(before, bounds)).toBeNull();

    const after = createPeriod(new Date(2024, 0, 25), new Date(2024, 0, 30));
    expect(clamp(after, bounds)).toBeNull();
  });

  it("returns type custom", () => {
    const inner = createPeriod(new Date(2024, 0, 12), new Date(2024, 0, 18));
    expect(clamp(inner, bounds)!.type).toBe("custom");
  });
});
