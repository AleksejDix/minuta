import {
  createTextBuffer,
  deleteBackward,
  deleteForward,
  insertText,
  moveCursor,
  replaceRange,
  select,
  selectionEnd,
  selectionStart,
} from "./text-buffer";
import { describe, expect, it } from "vitest";

const START = 0;
const ONE = 1;
const TWO = 2;
const THREE = 3;
const FIVE = 5;
const BACK = -1;
const FAR_BACK = -99;
const FAR_AHEAD = 99;

describe("createTextBuffer()", () => {
  it("defaults to empty text with the cursor at 0", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(createTextBuffer()).toStrictEqual({
      selection: { anchor: 0, head: 0 },
      text: "",
    });
  });

  it(
    "puts the cursor at the end of the initial text",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      expect(createTextBuffer("hello").selection).toStrictEqual({
        anchor: 5,
        head: 5,
      });
    }
  );

  it("clamps an initial selection into the text", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const buffer = createTextBuffer("abc", {
      anchor: FAR_BACK,
      head: FAR_AHEAD,
    });
    expect(buffer.selection).toStrictEqual({ anchor: 0, head: 3 });
  });
});

describe("select()", () => {
  it(
    "collapses to one position when head is omitted",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      expect(select(createTextBuffer("abc"), ONE).selection).toStrictEqual({
        anchor: 1,
        head: 1,
      });
    }
  );

  it(
    "keeps a backwards selection and normalises start/end",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const buffer = select(createTextBuffer("abcdef"), FIVE, TWO);
      expect([selectionStart(buffer), selectionEnd(buffer)]).toStrictEqual([
        TWO,
        FIVE,
      ]);
      expect(buffer.selection).toStrictEqual({ anchor: 5, head: 2 });
    }
  );

  it("returns the same buffer when nothing changes", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const buffer = createTextBuffer("abc");
    expect(select(buffer, THREE)).toBe(buffer);
  });
});

describe("moveCursor()", () => {
  it(
    "moves a collapsed cursor and clamps at the edges",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const buffer = createTextBuffer("abc");
      expect(moveCursor(buffer, BACK).selection.head).toBe(TWO);
      expect(moveCursor(buffer, FAR_AHEAD).selection.head).toBe(THREE);
      expect(moveCursor(buffer, FAR_BACK).selection.head).toBe(START);
    }
  );

  it(
    "collapses a selection to its start when moving back",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const buffer = moveCursor(
        select(createTextBuffer("abcdef"), ONE, FIVE),
        BACK
      );
      expect(buffer.selection).toStrictEqual({ anchor: 1, head: 1 });
    }
  );

  it(
    "collapses a selection to its end when moving ahead",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const buffer = moveCursor(
        select(createTextBuffer("abcdef"), FIVE, ONE),
        ONE
      );
      expect(buffer.selection).toStrictEqual({ anchor: 5, head: 5 });
    }
  );
});

describe("insertText()", () => {
  it(
    "inserts at the cursor and moves the cursor after it",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const buffer = insertText(select(createTextBuffer("ac"), ONE), "b");
      expect(buffer).toStrictEqual({
        selection: { anchor: 2, head: 2 },
        text: "abc",
      });
    }
  );

  it("replaces the selection", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const buffer = insertText(
      select(createTextBuffer("a123e"), ONE, FIVE - ONE),
      "bcd"
    );
    expect(buffer).toStrictEqual({
      selection: { anchor: 4, head: 4 },
      text: "abcde",
    });
  });

  it(
    "returns the same buffer for an empty insert without selection",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const buffer = createTextBuffer("abc");
      expect(insertText(buffer, "")).toBe(buffer);
    }
  );
});

describe("deleteBackward()", () => {
  it("deletes the character before the cursor", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const buffer = deleteBackward(select(createTextBuffer("abc"), TWO));
    expect(buffer).toStrictEqual({
      selection: { anchor: 1, head: 1 },
      text: "ac",
    });
  });

  it(
    "deletes the selection instead when there is one",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const buffer = deleteBackward(
        select(createTextBuffer("abcdef"), ONE, FIVE)
      );
      expect(buffer).toStrictEqual({
        selection: { anchor: 1, head: 1 },
        text: "af",
      });
    }
  );

  it("is a no-op at the start", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const buffer = select(createTextBuffer("abc"), START);
    expect(deleteBackward(buffer)).toBe(buffer);
  });
});

describe("deleteForward()", () => {
  it("deletes the character after the cursor", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const buffer = deleteForward(select(createTextBuffer("abc"), ONE));
    expect(buffer).toStrictEqual({
      selection: { anchor: 1, head: 1 },
      text: "ac",
    });
  });

  it("is a no-op at the end", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const buffer = createTextBuffer("abc");
    expect(deleteForward(buffer)).toBe(buffer);
  });
});

describe("replaceRange()", () => {
  it(
    "replaces a range and puts the cursor after the new text",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const buffer = replaceRange(
        createTextBuffer("3_.03"),
        { from: ONE, to: TWO },
        "1"
      );
      expect(buffer).toStrictEqual({
        selection: { anchor: 2, head: 2 },
        text: "31.03",
      });
    }
  );

  it("clamps the range into the text", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const buffer = replaceRange(
      createTextBuffer("abc"),
      { from: TWO, to: FAR_AHEAD },
      "Z"
    );
    expect(buffer.text).toBe("abZ");
  });
});

describe("deleting whole characters", () => {
  it.each(["😀", "👨‍👩‍👧", "🇨🇭", "é"])(
    "removes %s with one backspace and one delete",
    { timeout: 5000 },
    (char) => {
      expect.hasAssertions();
      const text = `a${char}b`;
      const afterChar = ONE + char.length;
      const backspaced = deleteBackward(
        select(createTextBuffer(text), afterChar)
      );
      const deleted = deleteForward(select(createTextBuffer(text), ONE));
      expect([backspaced.text, deleted.text]).toStrictEqual(["ab", "ab"]);
    }
  );
});
