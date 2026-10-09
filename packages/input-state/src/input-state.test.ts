import {
  backspace,
  createInputState,
  deleteForward,
  isComplete,
  paste,
  setSelection,
  toggleMode,
  typeChar,
} from "./input-state";
import { describe, expect, it } from "vitest";
import type { InputState } from "./input-state";
import { parseMask } from "./mask";

const DATE = parseMask("99.99.9999");
const START = 0;
const ONE = 1;
const TWO = 2;
const THREE = 3;
const FOUR = 4;
const SIX = 6;
const EIGHT = 8;

function typeAll(state: InputState, text: string): InputState {
  let next = state;
  for (const char of text) {
    next = typeChar(next, char);
  }
  return next;
}

describe("createInputState()", () => {
  it(
    "starts a masked field with the empty template and cursor on the first slot",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const state = createInputState({ mask: DATE });
      expect(state.buffer).toStrictEqual({
        selection: { anchor: 0, head: 0 },
        text: "__.__.____",
      });
      expect(state.mode).toBe("overwrite");
    }
  );

  it("fills a masked field from an initial value", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const state = createInputState({ mask: DATE, value: "31.03" });
    expect(state.buffer.text).toBe("31.03.____");
    expect(state.buffer.selection.head).toBe(SIX);
  });

  it(
    "starts a free-text field in insert mode with the cursor at the end",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const state = createInputState({ value: "hi" });
      expect(state.mode).toBe("insert");
      expect(state.buffer.selection.head).toBe(TWO);
    }
  );
});

describe("typeChar() with a mask", () => {
  it(
    "fills slots left to right and skips separators",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const state = typeAll(createInputState({ mask: DATE }), "31032026");
      expect(state.buffer.text).toBe("31.03.2026");
      expect(isComplete(state)).toBe(true);
    }
  );

  it("corrects one digit without shifting the rest", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const filled = createInputState({ mask: DATE, value: "31.03.2026" });
    const state = typeChar(setSelection(filled, EIGHT), "1");
    expect(state.buffer.text).toBe("31.03.2016");
    expect(state.buffer.selection.head).toBe(EIGHT + ONE);
  });

  it(
    "types into the next slot when the cursor sits on a separator",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const filled = createInputState({ mask: DATE, value: "31.03.2026" });
      const state = typeChar(setSelection(filled, TWO), "1");
      expect(state.buffer.text).toBe("31.13.2026");
      expect(state.buffer.selection.head).toBe(FOUR);
    }
  );
});

describe("typeChar() with a mask, rejected input", () => {
  it("rejects characters the slot does not accept", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const state = createInputState({ mask: DATE });
    expect(typeChar(state, "x")).toBe(state);
  });

  it("ignores input past the last slot", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const state = createInputState({ mask: DATE, value: "31.03.2026" });
    expect(typeChar(state, "5")).toBe(state);
  });

  it("clears a selected range before typing into it", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const filled = createInputState({ mask: DATE, value: "31.03.2026" });
    const state = typeChar(setSelection(filled, START, THREE + TWO), "1");
    expect(state.buffer.text).toBe("1_.__.2026");
    expect(state.buffer.selection.head).toBe(ONE);
  });
});

describe("backspace() and deleteForward() with a mask", () => {
  it(
    "backspace turns the previous slot into a placeholder and hops separators",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const filled = createInputState({ mask: DATE, value: "31.03.2026" });
      const state = backspace(setSelection(filled, THREE));
      expect(state.buffer.text).toBe("3_.03.2026");
      expect(state.buffer.selection.head).toBe(ONE);
    }
  );

  it(
    "deleteForward clears the slot at the cursor and keeps the cursor",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const filled = createInputState({ mask: DATE, value: "31.03.2026" });
      const state = deleteForward(setSelection(filled, THREE));
      expect(state.buffer.text).toBe("31._3.2026");
      expect(state.buffer.selection.head).toBe(THREE);
    }
  );

  it("backspace clears a selection to placeholders", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const filled = createInputState({ mask: DATE, value: "31.03.2026" });
    const state = backspace(setSelection(filled, ONE, FOUR));
    expect(state.buffer.text).toBe("3_._3.2026");
    expect(state.buffer.selection.head).toBe(ONE);
  });

  it("backspace at the first slot is a no-op", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const state = createInputState({ mask: DATE });
    expect(backspace(state)).toBe(state);
  });
});

describe("paste() with a mask", () => {
  it("distributes characters and skips invalid ones", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const state = paste(createInputState({ mask: DATE }), "31/03/2026");
    expect(state.buffer.text).toBe("31.03.2026");
  });
});

describe("free text without a mask", () => {
  it("inserts in insert mode", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const state = typeChar(
      setSelection(createInputState({ value: "ac" }), ONE),
      "b"
    );
    expect(state.buffer.text).toBe("abc");
  });

  it("replaces the next character in overwrite mode", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const overwrite = toggleMode(
      setSelection(createInputState({ value: "abc" }), ONE)
    );
    expect(overwrite.mode).toBe("overwrite");
    expect(typeChar(overwrite, "X").buffer.text).toBe("aXc");
  });

  it(
    "appends in overwrite mode at the end of the text",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const overwrite = toggleMode(createInputState({ value: "ab" }));
      expect(typeChar(overwrite, "c").buffer.text).toBe("abc");
    }
  );

  it(
    "backspace and paste behave like a normal text field",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const state = paste(backspace(createInputState({ value: "abc" })), "XY");
      expect(state.buffer.text).toBe("abXY");
    }
  );
});

describe("toggleMode()", () => {
  it(
    "does not change a masked field (always overwrite)",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const state = createInputState({ mask: DATE });
      expect(toggleMode(state)).toBe(state);
    }
  );
});

describe("characters outside the BMP", () => {
  it(
    "rejects an astral letter without corrupting the mask",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const field = paste(
        createInputState({ mask: parseMask("AA99") }),
        "𝐀BC12"
      );
      expect(field.buffer.text).toBe("BC12");
    }
  );
});
