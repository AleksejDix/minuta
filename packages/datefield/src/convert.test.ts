import { deriveFormat, parseSegments } from "./parse";
import { describe, expect, it } from "vitest";
import { fromDate, segmentsToString, toDate } from "./convert";

const format = deriveFormat("de-CH");

describe("toDate()", () => {
  it("converts valid segments to a Date", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const segments = parseSegments(format, "31.03.2026");
    const date = toDate(segments);
    expect(date).toStrictEqual(new Date("2026-03-31T00:00:00"));
  });

  it("returns undefined for invalid date (Feb 30)", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const segments = parseSegments(format, "30.02.2026");
    expect(toDate(segments)).toBeUndefined();
  });

  it("returns undefined for incomplete segments", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const segments = parseSegments(format, "__.__.____ ");
    expect(toDate(segments)).toBeUndefined();
  });

  it("handles leap year Feb 29", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const segments = parseSegments(format, "29.02.2024");
    const date = toDate(segments);
    expect(date).toStrictEqual(new Date("2024-02-29T00:00:00"));
  });

  it("rejects non-leap year Feb 29", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const segments = parseSegments(format, "29.02.2025");
    expect(toDate(segments)).toBeUndefined();
  });
});

describe("fromDate()", () => {
  it("converts a Date to segments in de-CH format", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const date = new Date("2026-03-31T00:00:00");
    const segments = fromDate(date, format);

    expect(segments).toStrictEqual([
      { end: 2, start: 0, type: "day", value: "31" },
      { end: 3, start: 2, type: "literal", value: "." },
      { end: 5, start: 3, type: "month", value: "03" },
      { end: 6, start: 5, type: "literal", value: "." },
      { end: 10, start: 6, type: "year", value: "2026" },
    ]);
  });

  it("converts to en-US format", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const usFormat = deriveFormat("en-US");
    const date = new Date("2026-01-05T00:00:00");
    const [month, , day, , year] = fromDate(date, usFormat);

    expect(month).toMatchObject({ type: "month", value: "01" });
    expect(day).toMatchObject({ type: "day", value: "05" });
    expect(year).toMatchObject({ value: "2026" });
  });
});

describe("segmentsToString()", () => {
  it("concatenates segment values", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const segments = parseSegments(format, "31.03.2026");
    expect(segmentsToString(segments)).toBe("31.03.2026");
  });
});

describe("toDate() with gaps", () => {
  it(
    "returns undefined while a segment still has a gap",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      expect(toDate(parseSegments(format, "3_.03.2026"))).toBeUndefined();
    }
  );
});
