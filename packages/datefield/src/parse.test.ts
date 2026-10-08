import {
  deriveFormat,
  formatLength,
  parseSegments,
  placeholder,
} from "./parse";
import { describe, expect, it } from "vitest";
import type { FormatToken } from "./types";

const EDITABLE_SEGMENT_COUNT = 3;
const DE_CH_LENGTH = 10;

describe("deriveFormat() for common locales", () => {
  it("derives DD.MM.YYYY for de-CH", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const tokens = deriveFormat("de-CH");
    expect(tokens).toStrictEqual([
      { length: 2, type: "day" },
      { char: ".", type: "literal" },
      { length: 2, type: "month" },
      { char: ".", type: "literal" },
      { length: 4, type: "year" },
    ]);
  });

  it("derives MM/DD/YYYY for en-US", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const tokens = deriveFormat("en-US");
    expect(tokens).toStrictEqual([
      { length: 2, type: "month" },
      { char: "/", type: "literal" },
      { length: 2, type: "day" },
      { char: "/", type: "literal" },
      { length: 4, type: "year" },
    ]);
  });

  it("derives DD/MM/YYYY for en-GB", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const tokens = deriveFormat("en-GB");
    expect(tokens).toStrictEqual([
      { length: 2, type: "day" },
      { char: "/", type: "literal" },
      { length: 2, type: "month" },
      { char: "/", type: "literal" },
      { length: 4, type: "year" },
    ]);
  });
});

describe("deriveFormat() token order", () => {
  it("puts year first for ja-JP", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const [first] = deriveFormat("ja-JP");
    expect(first).toMatchObject({ type: "year" });
  });

  it("contains exactly 3 editable segments", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const tokens = deriveFormat("fr-FR");
    const editable = tokens.filter(
      (token: Readonly<FormatToken>) => token.type !== "literal"
    );
    expect(editable).toHaveLength(EDITABLE_SEGMENT_COUNT);
  });
});

describe("parseSegments()", () => {
  const format = deriveFormat("de-CH");

  it("parses a valid date string", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const segments = parseSegments(format, "31.03.2026");
    expect(segments).toStrictEqual([
      { end: 2, start: 0, type: "day", value: "31" },
      { end: 3, start: 2, type: "literal", value: "." },
      { end: 5, start: 3, type: "month", value: "03" },
      { end: 6, start: 5, type: "literal", value: "." },
      { end: 10, start: 6, type: "year", value: "2026" },
    ]);
  });

  it("parses US format", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const usFormat = deriveFormat("en-US");
    const [month, , day, , year] = parseSegments(usFormat, "03/31/2026");
    expect(month).toStrictEqual({
      end: 2,
      start: 0,
      type: "month",
      value: "03",
    });
    expect(day).toStrictEqual({ end: 5, start: 3, type: "day", value: "31" });
    expect(year).toStrictEqual({
      end: 10,
      start: 6,
      type: "year",
      value: "2026",
    });
  });
});

describe("placeholder()", () => {
  it("generates placeholder for de-CH", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(placeholder(deriveFormat("de-CH"))).toBe("__.__.____");
  });

  it("generates placeholder for en-US", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(placeholder(deriveFormat("en-US"))).toBe("__/__/____");
  });
});

describe("formatLength()", () => {
  it("returns 10 for de-CH", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(formatLength(deriveFormat("de-CH"))).toBe(DE_CH_LENGTH);
  });
});
