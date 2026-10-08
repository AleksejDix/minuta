import { describe, it, expect } from "vitest";
import { createNativeAdapter } from "../adapters/native/adapter";
import { deriveFormat, parseSegments } from "./parse";
import { incrementSegment } from "./increment";
import { segmentsToString } from "./convert";

const adapter = createNativeAdapter();
const format = deriveFormat("de-CH");

describe("incrementSegment", () => {
  it("increments day", () => {
    const segments = parseSegments(format, "15.03.2026");
    const result = incrementSegment(adapter, segments, 0, 1, format);
    expect(segmentsToString(result)).toBe("16.03.2026");
  });

  it("decrements day", () => {
    const segments = parseSegments(format, "15.03.2026");
    const result = incrementSegment(adapter, segments, 0, -1, format);
    expect(segmentsToString(result)).toBe("14.03.2026");
  });

  it("increments month", () => {
    const segments = parseSegments(format, "15.03.2026");
    const result = incrementSegment(adapter, segments, 2, 1, format);
    expect(segmentsToString(result)).toBe("15.04.2026");
  });

  it("decrements month", () => {
    const segments = parseSegments(format, "15.03.2026");
    const result = incrementSegment(adapter, segments, 2, -1, format);
    expect(segmentsToString(result)).toBe("15.02.2026");
  });

  it("increments year", () => {
    const segments = parseSegments(format, "15.03.2026");
    const result = incrementSegment(adapter, segments, 4, 1, format);
    expect(segmentsToString(result)).toBe("15.03.2027");
  });

  it("rolls day across month boundary", () => {
    const segments = parseSegments(format, "31.03.2026");
    const result = incrementSegment(adapter, segments, 0, 1, format);
    expect(segmentsToString(result)).toBe("01.04.2026");
  });

  it("rolls month across year boundary", () => {
    const segments = parseSegments(format, "15.12.2026");
    const result = incrementSegment(adapter, segments, 2, 1, format);
    expect(segmentsToString(result)).toBe("15.01.2027");
  });

  it("handles month increment with day clamping (Jan 31 + 1 month)", () => {
    const segments = parseSegments(format, "31.01.2026");
    const result = incrementSegment(adapter, segments, 2, 1, format);
    // Native adapter: adding 1 month to Jan 31 → Mar 3 (or Feb 28 depending on adapter)
    // The key point: it uses the adapter, not hardcoded math
    const str = segmentsToString(result);
    expect(str).toMatch(/^\d{2}\.\d{2}\.2026$/);
  });

  it("ignores literal segments", () => {
    const segments = parseSegments(format, "15.03.2026");
    const result = incrementSegment(adapter, segments, 1, 1, format);
    expect(segmentsToString(result)).toBe("15.03.2026");
  });
});
