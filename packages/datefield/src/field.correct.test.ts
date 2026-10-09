import { createInputState, paste, setSelection, typeChar } from "input-state";
import { dateMask, withSegments } from "./field";
import { deriveFormat, parseSegments } from "./parse";
import { describe, expect, it } from "vitest";
import type { InputState } from "input-state";
import { clampDay } from "./rotate";
import { localeDigits } from "./digits";
import { toDate } from "./convert";

const DE = deriveFormat("de-CH");
const MONTH_START = 3;
const YEAR_START = 6;

/**
 * Type each character like a user, clamping the day after every keystroke
 * with the cursor, as the README recommends.
 *
 * @param state - The field
 * @param text - Characters to type
 * @returns The field after typing
 */
function typeClamped(state: InputState, text: string): InputState {
  let next = state;
  for (const char of text) {
    next = typeChar(next, char);
    const segments = parseSegments(DE, next.buffer.text);
    next = withSegments(next, clampDay(segments, next.buffer.selection.head));
  }
  return next;
}

function fieldAt(value: string, cursor: number): InputState {
  const field = createInputState({ mask: dateMask(DE), value });
  return setSelection(field, cursor);
}

describe("correcting a typed date", () => {
  it("keeps the day while the month is retyped", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const field = typeClamped(fieldAt("31.12.2026", MONTH_START), "03");
    expect(field.buffer.text).toBe("31.03.2026");
  });

  it("keeps a leap day while the year is retyped", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const field = typeClamped(fieldAt("29.02.2024", YEAR_START), "2032");
    expect(field.buffer.text).toBe("29.02.2032");
  });

  it("clamps once the month is finished", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const field = typeClamped(fieldAt("31.12.2026", MONTH_START), "02");
    expect(field.buffer.text).toBe("28.02.2026");
  });

  it("clamps once the year is finished", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const field = typeClamped(fieldAt("29.02.2024", YEAR_START), "2026");
    expect(field.buffer.text).toBe("28.02.2026");
  });
});

describe("digits of other scripts", () => {
  it.each(["٣١٠٣٢٠٢٦", "３１０３２０２６"])(
    "turns pasted %s into a date",
    { timeout: 5000 },
    (digits) => {
      expect.hasAssertions();
      const field = paste(createInputState({ mask: dateMask(DE) }), digits);
      expect(field.buffer.text).toBe("31.03.2026");
      expect(toDate(parseSegments(DE, field.buffer.text))).toStrictEqual(
        new Date("2026-03-31T00:00:00")
      );
    }
  );
});

describe("characters JavaScript reads as numbers", () => {
  it.each(["e", "E", "+", "-", ".", "x"])(
    "rejects %s in a digit slot",
    { timeout: 5000 },
    (char) => {
      expect.hasAssertions();
      const field = createInputState({ mask: dateMask(DE) });
      expect(typeChar(field, char)).toBe(field);
    }
  );

  it("never converts exponent notation", { timeout: 5000 }, () => {
    expect.hasAssertions();
    // Number("1e") is NaN and Number("1e1") is 10; toDate only reads digits
    expect(toDate(parseSegments(DE, "1e.03.2026"))).toBeUndefined();
  });
});

describe("calendars", () => {
  it.each([
    ["fa-IR", "2026/03/31"],
    ["th-TH", "31/03/2026"],
    ["ja-JP-u-ca-japanese", "2026/03/31"],
  ])("gives %s a Gregorian field", { timeout: 5000 }, (locale, text) => {
    expect.hasAssertions();
    const format = deriveFormat(locale);
    expect(toDate(parseSegments(format, text))).toStrictEqual(
      new Date("2026-03-31T00:00:00")
    );
  });
});

describe("localeDigits()", () => {
  const THREE = 3;

  it.each([
    ["ar-EG", "٣"],
    ["fa-IR", "۳"],
    ["hi-IN-u-nu-deva", "३"],
    ["de-CH", "3"],
    ["ff-Adlm-GN", "3"],
  ])("gives %s the digit %s for three", { timeout: 5000 }, (locale, three) => {
    expect.hasAssertions();
    expect(localeDigits(locale)[THREE]).toBe(three);
  });
});
