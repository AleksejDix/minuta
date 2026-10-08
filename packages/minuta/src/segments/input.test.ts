import { describe, it, expect } from "vitest";
import { deriveFormat, parseSegments } from "./parse";
import { inputDigit, clearSegment } from "./input";
import { segmentsToString } from "./convert";

const format = deriveFormat("de-CH");

describe("inputDigit", () => {
  it("types first digit into day segment", () => {
    const segments = parseSegments(format, "__.__.____");
    const { segments: result, activeIndex } = inputDigit(segments, 0, "3");
    expect(result[0].value).toBe("_3");
    expect(activeIndex).toBe(0); // not full yet
  });

  it("types second digit and advances to month", () => {
    const segments = parseSegments(format, "_3.__.____");
    const { segments: result, activeIndex } = inputDigit(segments, 0, "1");
    expect(result[0].value).toBe("31");
    expect(activeIndex).toBe(2); // advanced to month
  });

  it("types into month segment", () => {
    const segments = parseSegments(format, "31.__.____");
    const { segments: result, activeIndex } = inputDigit(segments, 2, "0");
    expect(result[2].value).toBe("_0");
    expect(activeIndex).toBe(2);
  });

  it("completes month and advances to year", () => {
    const segments = parseSegments(format, "31._0.____");
    const { segments: result, activeIndex } = inputDigit(segments, 2, "3");
    expect(result[2].value).toBe("03");
    expect(segmentsToString(result)).toBe("31.03.____");
    expect(activeIndex).toBe(4); // advanced to year
  });

  it("ignores non-digit characters", () => {
    const segments = parseSegments(format, "__.__.____");
    const { segments: result, activeIndex } = inputDigit(segments, 0, "a");
    expect(result[0].value).toBe("__");
    expect(activeIndex).toBe(0);
  });

  it("ignores input on literal segments", () => {
    const segments = parseSegments(format, "31.03.2026");
    const { segments: result, activeIndex } = inputDigit(segments, 1, "5");
    expect(segmentsToString(result)).toBe("31.03.2026");
    expect(activeIndex).toBe(1);
  });
});

describe("clearSegment", () => {
  it("clears the day segment", () => {
    const segments = parseSegments(format, "31.03.2026");
    const result = clearSegment(segments, 0);
    expect(result[0].value).toBe("__");
    expect(segmentsToString(result)).toBe("__.03.2026");
  });

  it("clears the year segment", () => {
    const segments = parseSegments(format, "31.03.2026");
    const result = clearSegment(segments, 4);
    expect(result[4].value).toBe("____");
    expect(segmentsToString(result)).toBe("31.03.____");
  });

  it("ignores literal segments", () => {
    const segments = parseSegments(format, "31.03.2026");
    const result = clearSegment(segments, 1);
    expect(segmentsToString(result)).toBe("31.03.2026");
  });
});
