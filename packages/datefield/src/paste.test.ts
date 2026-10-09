import { deriveFormat, parseSegments } from "./parse";
import { describe, expect, it } from "vitest";
import type { DateFormat } from "./types";
import { createInputState } from "input-state";
import { dateMask } from "./field";
import { toDate } from "./convert";
import { typeDate } from "./type-date";

const MARCH_31 = new Date("2026-03-31T00:00:00");
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

function pasted(locale: string, text: string): Date | undefined {
  const format: Readonly<DateFormat> = deriveFormat(locale);
  const field = createInputState({ mask: dateMask(format) });
  return toDate(
    parseSegments(format, typeDate(format, field, text, locale).buffer.text)
  );
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
      ]).toStrictEqual([
        new Date("2026-05-04T00:00:00"),
        new Date("2026-04-05T00:00:00"),
      ]);
    }
  );

  it("rejects a day that does not exist", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(pasted("de-CH", "2026-04-31")).toBeUndefined();
  });
});
