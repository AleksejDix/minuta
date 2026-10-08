import { clearSegment, inputDigit } from "./input";
import { deriveFormat, parseSegments } from "./parse";
import { describe, expect, it } from "vitest";
import type { Segment } from "./types";
import { segmentsToString } from "./convert";

const DAY_INDEX = 0;
const LITERAL_INDEX = 1;
const MONTH_INDEX = 2;
const YEAR_INDEX = 4;

const format = deriveFormat("de-CH");

function valueAt(
  segments: readonly Segment[],
  index: number
): string | undefined {
  const seg = segments[index];
  if (seg === undefined) {
    return undefined;
  }
  return seg.value;
}

describe("inputDigit() within a segment", () => {
  it("types first digit into day segment", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const segments = parseSegments(format, "__.__.____");
    const { segments: result, activeIndex } = inputDigit(
      segments,
      DAY_INDEX,
      "3"
    );
    expect(valueAt(result, DAY_INDEX)).toBe("_3");
    // Not full yet
    expect(activeIndex).toBe(DAY_INDEX);
  });

  it("types second digit and advances to month", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const segments = parseSegments(format, "_3.__.____");
    const { segments: result, activeIndex } = inputDigit(
      segments,
      DAY_INDEX,
      "1"
    );
    expect(valueAt(result, DAY_INDEX)).toBe("31");
    // Advanced to month
    expect(activeIndex).toBe(MONTH_INDEX);
  });

  it("types into month segment", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const segments = parseSegments(format, "31.__.____");
    const { segments: result, activeIndex } = inputDigit(
      segments,
      MONTH_INDEX,
      "0"
    );
    expect(valueAt(result, MONTH_INDEX)).toBe("_0");
    expect(activeIndex).toBe(MONTH_INDEX);
  });
});

describe("inputDigit() across segments", () => {
  it("completes month and advances to year", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const segments = parseSegments(format, "31._0.____");
    const { segments: result, activeIndex } = inputDigit(
      segments,
      MONTH_INDEX,
      "3"
    );
    expect(valueAt(result, MONTH_INDEX)).toBe("03");
    expect(segmentsToString(result)).toBe("31.03.____");
    // Advanced to year
    expect(activeIndex).toBe(YEAR_INDEX);
  });

  it("ignores non-digit characters", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const segments = parseSegments(format, "__.__.____");
    const { segments: result, activeIndex } = inputDigit(
      segments,
      DAY_INDEX,
      "a"
    );
    expect(valueAt(result, DAY_INDEX)).toBe("__");
    expect(activeIndex).toBe(DAY_INDEX);
  });

  it("ignores input on literal segments", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const segments = parseSegments(format, "31.03.2026");
    const { segments: result, activeIndex } = inputDigit(
      segments,
      LITERAL_INDEX,
      "5"
    );
    expect(segmentsToString(result)).toBe("31.03.2026");
    expect(activeIndex).toBe(LITERAL_INDEX);
  });
});

describe("clearSegment()", () => {
  it("clears the day segment", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const segments = parseSegments(format, "31.03.2026");
    const result = clearSegment(segments, DAY_INDEX);
    expect(valueAt(result, DAY_INDEX)).toBe("__");
    expect(segmentsToString(result)).toBe("__.03.2026");
  });

  it("clears the year segment", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const segments = parseSegments(format, "31.03.2026");
    const result = clearSegment(segments, YEAR_INDEX);
    expect(valueAt(result, YEAR_INDEX)).toBe("____");
    expect(segmentsToString(result)).toBe("31.03.____");
  });

  it("ignores literal segments", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const segments = parseSegments(format, "31.03.2026");
    const result = clearSegment(segments, LITERAL_INDEX);
    expect(segmentsToString(result)).toBe("31.03.2026");
  });
});
