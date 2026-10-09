import { createInputState, setSelection } from "input-state";
import { describe, expect, it } from "vitest";
import type { DateFormat } from "./types";
import { dateMask } from "./field";
import { deriveFormat } from "./parse";
import { typeDate } from "./type-date";

const DE = deriveFormat("de-CH");
const US = deriveFormat("en-US");
const JA = deriveFormat("ja-JP");
const MONTH_START = 3;

type TypeCase = Readonly<{
  expected: string;
  format: Readonly<DateFormat>;
  text: string;
}>;

const CASES: readonly TypeCase[] = [
  { expected: "01.03.2026", format: DE, text: "1.3.2026" },
  { expected: "31.03.2026", format: DE, text: "31.03.2026" },
  { expected: "01.03.2026", format: DE, text: "1 3 2026" },
  { expected: "01.03.2026", format: DE, text: "1/3/26" },
  { expected: "03/01/2026", format: US, text: "3/1/2026" },
  { expected: "2026/03/01", format: JA, text: "2026/3/1" },
  { expected: "01.03.2026", format: DE, text: "1.x3.2026" },
];

function typed(format: Readonly<DateFormat>, text: string): string {
  return typeDate(format, createInputState({ mask: dateMask(format) }), text)
    .buffer.text;
}

describe("typeDate()", () => {
  it.each(CASES)(
    "types $text as $expected",
    { timeout: 5000 },
    ({ expected, format, text }) => {
      expect.hasAssertions();
      expect(typed(format, text)).toBe(expected);
    }
  );

  it("finishes a retyped segment of a full date", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const field = setSelection(
      createInputState({ mask: dateMask(DE), value: "31.12.2026" }),
      MONTH_START
    );
    expect(typeDate(DE, field, "3.").buffer.text).toBe("31.03.2026");
  });
});
