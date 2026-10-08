import { describe, it, expect } from "vitest";
import {
  deriveFormat,
  parseSegments,
  placeholder,
  formatLength,
} from "./parse";

describe("deriveFormat", () => {
  it("derives DD.MM.YYYY for de-CH", () => {
    const tokens = deriveFormat("de-CH");
    expect(tokens).toEqual([
      { type: "day", length: 2 },
      { type: "literal", char: "." },
      { type: "month", length: 2 },
      { type: "literal", char: "." },
      { type: "year", length: 4 },
    ]);
  });

  it("derives MM/DD/YYYY for en-US", () => {
    const tokens = deriveFormat("en-US");
    expect(tokens).toEqual([
      { type: "month", length: 2 },
      { type: "literal", char: "/" },
      { type: "day", length: 2 },
      { type: "literal", char: "/" },
      { type: "year", length: 4 },
    ]);
  });

  it("derives DD/MM/YYYY for en-GB", () => {
    const tokens = deriveFormat("en-GB");
    expect(tokens).toEqual([
      { type: "day", length: 2 },
      { type: "literal", char: "/" },
      { type: "month", length: 2 },
      { type: "literal", char: "/" },
      { type: "year", length: 4 },
    ]);
  });

  it("puts year first for ja-JP", () => {
    const tokens = deriveFormat("ja-JP");
    expect(tokens[0].type).toBe("year");
  });

  it("contains exactly 3 editable segments", () => {
    const tokens = deriveFormat("fr-FR");
    const editable = tokens.filter((t) => t.type !== "literal");
    expect(editable).toHaveLength(3);
  });
});

describe("parseSegments", () => {
  const format = deriveFormat("de-CH");

  it("parses a valid date string", () => {
    const segments = parseSegments(format, "31.03.2026");
    expect(segments).toEqual([
      { type: "day", value: "31", start: 0, end: 2 },
      { type: "literal", value: ".", start: 2, end: 3 },
      { type: "month", value: "03", start: 3, end: 5 },
      { type: "literal", value: ".", start: 5, end: 6 },
      { type: "year", value: "2026", start: 6, end: 10 },
    ]);
  });

  it("parses US format", () => {
    const usFormat = deriveFormat("en-US");
    const segments = parseSegments(usFormat, "03/31/2026");
    expect(segments[0]).toEqual({
      type: "month",
      value: "03",
      start: 0,
      end: 2,
    });
    expect(segments[2]).toEqual({ type: "day", value: "31", start: 3, end: 5 });
    expect(segments[4]).toEqual({
      type: "year",
      value: "2026",
      start: 6,
      end: 10,
    });
  });
});

describe("placeholder", () => {
  it("generates placeholder for de-CH", () => {
    expect(placeholder(deriveFormat("de-CH"))).toBe("__.__.____");
  });

  it("generates placeholder for en-US", () => {
    expect(placeholder(deriveFormat("en-US"))).toBe("__/__/____");
  });
});

describe("formatLength", () => {
  it("returns 10 for de-CH", () => {
    expect(formatLength(deriveFormat("de-CH"))).toBe(10);
  });
});
