import { describe, it, expect } from "vitest";
import { deriveFormat, parseSegments } from "./parse";
import { rotateSegment, clampDay } from "./rotate";
import { segmentsToString } from "./convert";

const format = deriveFormat("de-CH");
const DAY = 0;
const MONTH = 2;
const YEAR = 4;
const today = new Date(2026, 9, 8);

const rotate = (text: string, index: number, direction: 1 | -1) =>
  segmentsToString(
    rotateSegment(parseSegments(format, text), index, direction, today)
  );

describe("rotateSegment", () => {
  it("wraps the day at the end of the month without touching the month", () => {
    expect(rotate("31.03.2026", DAY, 1)).toBe("01.03.2026");
    expect(rotate("01.03.2026", DAY, -1)).toBe("31.03.2026");
  });

  it("uses the actual month length", () => {
    expect(rotate("30.04.2026", DAY, 1)).toBe("01.04.2026");
    expect(rotate("28.02.2026", DAY, 1)).toBe("01.02.2026");
    expect(rotate("28.02.2024", DAY, 1)).toBe("29.02.2024");
  });

  it("assumes the widest range while month or year is unknown", () => {
    expect(rotate("30.__.____", DAY, 1)).toBe("31.__.____");
    expect(rotate("28.02.____", DAY, 1)).toBe("29.02.____");
  });

  it("wraps the month without touching the year", () => {
    expect(rotate("15.12.2026", MONTH, 1)).toBe("15.01.2026");
    expect(rotate("15.01.2026", MONTH, -1)).toBe("15.12.2026");
  });

  it("clamps the day when the month changes", () => {
    expect(rotate("31.01.2026", MONTH, 1)).toBe("28.02.2026");
    expect(rotate("31.03.2026", MONTH, 1)).toBe("30.04.2026");
  });

  it("clamps Feb 29 when the year changes to a non-leap year", () => {
    expect(rotate("29.02.2024", YEAR, 1)).toBe("28.02.2025");
  });

  it("steps the year without wrapping", () => {
    expect(rotate("15.03.2026", YEAR, 1)).toBe("15.03.2027");
    expect(rotate("15.03.2026", YEAR, -1)).toBe("15.03.2025");
  });

  it("starts an empty segment like a native date input", () => {
    expect(rotate("__.__.____", DAY, 1)).toBe("01.__.____");
    expect(rotate("__.__.____", DAY, -1)).toBe("31.__.____");
    expect(rotate("__.__.____", MONTH, -1)).toBe("__.12.____");
    expect(rotate("__.__.____", YEAR, 1)).toBe("__.__.2026");
  });

  it("leaves other segments untouched while they are incomplete", () => {
    expect(rotate("1_.03.20__", MONTH, 1)).toBe("1_.04.20__");
  });

  it("ignores literal segments", () => {
    expect(rotate("31.03.2026", 1, 1)).toBe("31.03.2026");
  });
});

describe("clampDay", () => {
  it("clamps a typed day that no longer fits the month", () => {
    const segments = parseSegments(format, "31.02.2026");
    expect(segmentsToString(clampDay(segments))).toBe("28.02.2026");
  });

  it("returns the same array when nothing changes", () => {
    const segments = parseSegments(format, "15.02.2026");
    expect(clampDay(segments)).toBe(segments);
  });
});
