import { describe, expect, it } from "vitest";
import type { Period } from "#src/types";
import { clamp } from "./clamp";
import { range } from "./period";

function clampOrFail(period: Period, bounds: Period): Period {
  const result = clamp(period, bounds);
  if (result === undefined) {
    throw new Error("Expected clamp to return a period");
  }
  return result;
}

function jan(day: string): Date {
  return new Date(`2024-01-${day}T00:00`);
}

const bounds = range(jan("10"), jan("20"));

describe("clamp() truncation", () => {
  it("truncates period that extends past bounds", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const wide = range(jan("05"), jan("25"));
    const result = clampOrFail(wide, bounds);
    expect(result.start).toStrictEqual(jan("10"));
    expect(result.end).toStrictEqual(jan("20"));
  });

  it("returns as-is when fully within bounds", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const inner = range(jan("12"), jan("18"));
    const result = clampOrFail(inner, bounds);
    expect(result.start).toStrictEqual(jan("12"));
    expect(result.end).toStrictEqual(jan("18"));
  });

  it("truncates start only", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const earlyStart = range(jan("05"), jan("15"));
    const result = clampOrFail(earlyStart, bounds);
    expect(result.start).toStrictEqual(jan("10"));
    expect(result.end).toStrictEqual(jan("15"));
  });

  it("truncates end only", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const lateEnd = range(jan("15"), jan("25"));
    const result = clampOrFail(lateEnd, bounds);
    expect(result.start).toStrictEqual(jan("15"));
    expect(result.end).toStrictEqual(jan("20"));
  });
});

describe("clamp() result", () => {
  it(
    "returns undefined when entirely outside bounds",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const before = range(jan("01"), jan("05"));
      expect(clamp(before, bounds)).toBeUndefined();

      const after = range(jan("25"), jan("30"));
      expect(clamp(after, bounds)).toBeUndefined();
    }
  );

  it("returns unit custom", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const inner = range(jan("12"), jan("18"));
    expect(clampOrFail(inner, bounds).unit).toBe("custom");
  });
});
