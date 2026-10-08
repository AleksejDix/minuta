import { clampDay, rotateSegment } from "./rotate";
import {
  createInputState,
  emptyText,
  setSelection,
  typeChar,
} from "input-state";
import { dateMask, withSegments } from "./field";
import { deriveFormat, parseSegments } from "./parse";
import { describe, expect, it } from "vitest";
import type { InputState } from "input-state";
import { toDate } from "./convert";

const DE = deriveFormat("de-CH");
const MONTH_SEGMENT = 2;
const MONTH_CURSOR = 3;
const UP = 1;

function typeAll(state: InputState, text: string): InputState {
  let next = state;
  for (const char of text) {
    next = typeChar(next, char);
  }
  return next;
}

describe("dateMask()", () => {
  it("follows the locale order and separators", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(emptyText(dateMask(DE))).toBe("__.__.____");
    const usMask = dateMask(deriveFormat("en-US"));
    expect(emptyText(usMask)).toBe("__/__/____");
  });

  it("keeps multi-character separators as literals", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const koMask = dateMask(deriveFormat("ko-KR"));
    expect(emptyText(koMask)).toBe("____. __. __.");
  });

  it("rejects display-only parts", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const withWeekday = deriveFormat("en-US", {
      day: "2-digit",
      weekday: "short",
    });
    expect(() => dateMask(withWeekday)).toThrow(RangeError);
  });
});

describe("withSegments()", () => {
  it(
    "writes rotated segments back and keeps the cursor",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const field = setSelection(
        createInputState({ mask: dateMask(DE), value: "31.12.2026" }),
        MONTH_CURSOR
      );
      const rotated = rotateSegment(
        parseSegments(DE, field.buffer.text),
        MONTH_SEGMENT,
        UP
      );
      const next = withSegments(field, rotated);
      expect(next.buffer.text).toBe("31.01.2026");
      expect(next.buffer.selection.head).toBe(MONTH_CURSOR);
    }
  );

  it("returns the same state when nothing changes", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const field = createInputState({ mask: dateMask(DE), value: "15.02.2026" });
    const clamped = clampDay(parseSegments(DE, field.buffer.text));
    expect(withSegments(field, clamped)).toBe(field);
  });
});

describe("date field typing", () => {
  it(
    "types a date, clamps the day and yields a Date",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const typed = typeAll(
        createInputState({ mask: dateMask(DE) }),
        "31022026"
      );
      const clamped = withSegments(
        typed,
        clampDay(parseSegments(DE, typed.buffer.text))
      );
      expect(clamped.buffer.text).toBe("28.02.2026");
      expect(toDate(parseSegments(DE, clamped.buffer.text))).toStrictEqual(
        new Date("2026-02-28T00:00:00")
      );
    }
  );
});
