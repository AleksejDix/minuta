import { describe, it, expect } from "vitest";
import { createNativeAdapter } from "../adapters/native/adapter";
import { deriveFormat, parseSegments } from "./parse";
import { toDate, fromDate, segmentsToString } from "./convert";

const adapter = createNativeAdapter();
const format = deriveFormat("de-CH");

describe("toDate", () => {
  it("converts valid segments to a Date", () => {
    const segments = parseSegments(format, "31.03.2026");
    const date = toDate(adapter, segments);
    expect(date).toEqual(new Date(2026, 2, 31));
  });

  it("returns undefined for invalid date (Feb 30)", () => {
    const segments = parseSegments(format, "30.02.2026");
    expect(toDate(adapter, segments)).toBeUndefined();
  });

  it("returns undefined for incomplete segments", () => {
    const segments = parseSegments(format, "__.__.____ ");
    expect(toDate(adapter, segments)).toBeUndefined();
  });

  it("handles leap year Feb 29", () => {
    const segments = parseSegments(format, "29.02.2024");
    const date = toDate(adapter, segments);
    expect(date).toEqual(new Date(2024, 1, 29));
  });

  it("rejects non-leap year Feb 29", () => {
    const segments = parseSegments(format, "29.02.2025");
    expect(toDate(adapter, segments)).toBeUndefined();
  });
});

describe("fromDate", () => {
  it("converts a Date to segments in de-CH format", () => {
    const date = new Date(2026, 2, 31);
    const segments = fromDate(adapter, date, format);

    expect(segments).toEqual([
      { type: "day", value: "31", start: 0, end: 2 },
      { type: "literal", value: ".", start: 2, end: 3 },
      { type: "month", value: "03", start: 3, end: 5 },
      { type: "literal", value: ".", start: 5, end: 6 },
      { type: "year", value: "2026", start: 6, end: 10 },
    ]);
  });

  it("converts to en-US format", () => {
    const usFormat = deriveFormat("en-US");
    const date = new Date(2026, 0, 5);
    const segments = fromDate(adapter, date, usFormat);

    expect(segments[0].value).toBe("01");
    expect(segments[0].type).toBe("month");
    expect(segments[2].value).toBe("05");
    expect(segments[2].type).toBe("day");
    expect(segments[4].value).toBe("2026");
  });
});

describe("segmentsToString", () => {
  it("concatenates segment values", () => {
    const segments = parseSegments(format, "31.03.2026");
    expect(segmentsToString(segments)).toBe("31.03.2026");
  });
});

describe("toDate with gaps", () => {
  it("returns undefined while a segment still has a gap", () => {
    expect(
      toDate(adapter, parseSegments(format, "3_.03.2026"))
    ).toBeUndefined();
  });
});
