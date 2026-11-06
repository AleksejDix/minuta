import { dateOrder, deriveFormat, parseSegments } from "./parse";
import { describe, expect, it } from "vitest";
import type { DateFormat } from "./types";
import type { FieldValue } from "./temporal";
import { createInputState } from "@aleksejdix/input-state";
import { dateMask } from "./field";
import { parseDate } from "@aleksejdix/fechita";
import { toPlainDate } from "./temporal";
import { typeDate } from "./type-date";

// The day a field's text makes, as Temporal writes it
function dayIn(format: Readonly<DateFormat>, text: string): string {
  return String(toPlainDate(parseSegments(format, text)));
}

const MARCH_31 = "2026-03-31";
const LOCALES: readonly string[] = [
  "de-CH",
  "en-US",
  "ja-JP",
  "fr-FR",
  "ar-EG",
];
const PASTED: readonly string[] = [
  "31.03.2026",
  "2026-03-31",
  "2026-03-31T10:00:00",
  "31/03/2026",
  "3/31/2026",
  "2026/3/31",
  "March 31, 2026",
  "31 Mar 2026",
  "Tue Mar 31 2026",
  " 31.03.2026 ",
  "٣١/٠٣/٢٠٢٦",
];

// Fechita reads the paste; the field's own order resolves ambiguity
function parsedDate(
  text: string,
  locale: string,
  format: Readonly<DateFormat>
): FieldValue | undefined {
  const result = parseDate(text, { locale, order: dateOrder(format) });
  if (!result.valid || result.kind === "instant") {
    return undefined;
  }
  return result.value;
}

function parserFor(
  locale: string,
  format: Readonly<DateFormat>
): (text: string) => FieldValue | undefined {
  return (text) => parsedDate(text, locale, format);
}

// The day the field holds after the paste, as Temporal writes it
function pasted(locale: string, text: string): string {
  const format: Readonly<DateFormat> = deriveFormat(locale);
  const field = createInputState({ mask: dateMask(format) });
  const parse = parserFor(locale, format);
  return dayIn(format, typeDate(format, field, text, { parse }).buffer.text);
}

function typedWithoutParser(locale: string, text: string): string {
  const format: Readonly<DateFormat> = deriveFormat(locale);
  return typeDate(format, createInputState({ mask: dateMask(format) }), text)
    .buffer.text;
}

describe.each(LOCALES)("pasting into a %s field", (locale) => {
  it.each(PASTED)("reads %j as 31 March 2026", { timeout: 5000 }, (text) => {
    expect.hasAssertions();
    expect(pasted(locale, text)).toStrictEqual(MARCH_31);
  });
});

describe("pasted dates in other forms", () => {
  it("reads month names of the field's locale", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(pasted("de-CH", "31. März 2026")).toStrictEqual(MARCH_31);
  });

  it(
    "follows the field's order when day and month are ambiguous",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      expect([
        pasted("de-CH", "04/05/2026"),
        pasted("en-US", "04/05/2026"),
      ]).toStrictEqual(["2026-05-04", "2026-04-05"]);
    }
  );

  it("rejects a day that does not exist", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(pasted("de-CH", "2026-04-31")).toBe("undefined");
  });
});

describe("pasting without a parser", () => {
  it("types the paste like keystrokes", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect([
      typedWithoutParser("de-CH", "31.03.2026"),
      typedWithoutParser("de-CH", "2026-03-31"),
    ]).toStrictEqual(["31.03.2026", "20.26.2003"]);
  });
});
