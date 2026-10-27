import { createInputState, setSelection } from "@aleksejdix/input-state";
import { describe, expect, it } from "vitest";
import { finishField, typeDate } from "./type-date";
import type { DateFormat } from "./types";
import { dateMask } from "./field";
import { deriveFormat } from "./parse";

const DE = deriveFormat("de-CH");
const US = deriveFormat("en-US");
const JA = deriveFormat("ja-JP");
const DE_SHORT = deriveFormat("de-CH", {
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
});
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
  { expected: "01.03.05", format: DE_SHORT, text: "1.3.5" },
  { expected: "01.03.26", format: DE_SHORT, text: "1.3.26." },
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

describe("finishField()", () => {
  it("pads the segment being typed", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const field = typeDate(
      DE,
      createInputState({ mask: dateMask(DE) }),
      "1.3.5"
    );
    expect(finishField(DE, field).buffer.text).toBe("01.03.2005");
  });

  it("clamps the day to the month", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const field = typeDate(
      DE,
      createInputState({ mask: dateMask(DE) }),
      "31.02.2026"
    );
    expect(finishField(DE, field).buffer.text).toBe("28.02.2026");
  });

  it("clamps a day typed while the month was open", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const field = setSelection(
      createInputState({ mask: dateMask(DE), value: "31.02.2026" }),
      MONTH_START
    );
    expect(finishField(DE, field).buffer.text).toBe("28.02.2026");
  });

  it("returns an empty field unchanged", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const field = createInputState({ mask: dateMask(DE) });
    expect(finishField(DE, field)).toBe(field);
  });
});

const TIME = deriveFormat("de-CH", {
  hour: "2-digit",
  hourCycle: "h23",
  minute: "2-digit",
});

// Typed one key at a time, as keystrokes arrive
function keyed(format: Readonly<DateFormat>, keys: string): string {
  let field = createInputState({ mask: dateMask(format) });
  for (const key of keys) {
    field = typeDate(format, field, key);
  }
  return field.buffer.text;
}

const IMPOSSIBLE_CASES: readonly TypeCase[] = [
  // A first digit no value can start with is padded, and the next part follows
  { expected: "12:06", format: TIME, text: "126" },
  { expected: "03:15", format: TIME, text: "315" },
  { expected: "04.02.2026", format: DE, text: "422026" },
  { expected: "15.07.2026", format: DE, text: "1572026" },
  { expected: "05/01/2026", format: US, text: "5012026" },
  // A second digit that would pass the largest value is not taken
  { expected: "23:09", format: TIME, text: "2439" },
  { expected: "31.02.2026", format: DE, text: "34122026" },
  { expected: "11.12.2026", format: DE, text: "111322026" },
];

describe("typeDate() refuses a part that cannot exist", () => {
  it.each(IMPOSSIBLE_CASES)(
    "types $text as $expected",
    { timeout: 5000 },
    ({ expected, format, text }) => {
      expect.hasAssertions();
      expect(keyed(format, text)).toBe(expected);
    }
  );

  it(
    "leaves a paste as pasted, so the field can say it is wrong",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      expect(typed(TIME, "12:60")).toBe("12:60");
    }
  );

  it(
    "pads a first minute digit typed over a whole time",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const field = setSelection(
        createInputState({ mask: dateMask(TIME), value: "12:30" }),
        MONTH_START
      );
      expect(typeDate(TIME, field, "7").buffer.text).toBe("12:07");
    }
  );
});
