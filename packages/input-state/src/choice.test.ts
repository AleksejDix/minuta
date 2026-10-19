import {
  backspace,
  createInputState,
  deleteForward,
  isComplete,
  isEmpty,
  paste,
  setSelection,
  typeChar,
} from "./input-state";
import { choiceTokens, emptyText, parseMask } from "./mask";
import { describe, expect, it } from "vitest";
import type { InputState } from "./input-state";
import type { Mask } from "./mask";

const NBSP = "\u00A0";
const LAST_MINUTE_DIGIT = 4;
const PERIOD_START = 6;
const END = 8;
const ONE = 1;

function timeMask(options: readonly string[]): Mask {
  const time = parseMask("99:99 ");
  return {
    placeholder: time.placeholder,
    tokens: [...time.tokens, ...choiceTokens(options)],
  };
}

const EN = timeMask(["AM", "PM"]);

function typed(mask: Mask, text: string): InputState {
  let state = createInputState({ mask });
  for (const char of text) {
    state = typeChar(state, char);
  }
  return state;
}

describe("choiceTokens()", () => {
  it("takes one position per character", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(emptyText(EN)).toBe("__:__ __");
    expect(isEmpty(createInputState({ mask: EN }))).toBe(true);
  });
});

describe("typeChar() on a choice", () => {
  it("picks the option a letter starts", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const state = typed(EN, "1030p");
    expect(state.buffer.text).toBe("10:30 PM");
    expect(state.buffer.selection.head).toBe(END);
    expect(isComplete(state)).toBe(true);
  });

  it("ignores case and rejects other letters", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(typed(EN, "1030A").buffer.text).toBe("10:30 AM");
    expect(typed(EN, "1030x").buffer.text).toBe("10:30 __");
  });

  it("picks by the first letter that differs", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const japanese = timeMask(["午前", "午後"]);
    expect(typed(japanese, "1030後").buffer.text).toBe("10:30 午後");
    // 午 starts both options, so it picks neither
    expect(typed(japanese, "1030午").buffer.text).toBe("10:30 __");
  });

  it("takes a and p for the two periods", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const japanese = timeMask(["午前", "午後"]);
    expect(typed(japanese, "1030p").buffer.text).toBe("10:30 午後");
  });

  it("pads a shorter option", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const malay = timeMask(["PG", "PTG"]);
    expect(emptyText(malay)).toBe("__:__ ___");
    expect(typed(malay, "1030g").buffer.text).toBe(`10:30 PG${NBSP}`);
    expect(typed(malay, "1030t").buffer.text).toBe("10:30 PTG");
  });
});

describe("deleting a choice", () => {
  it("clears the whole choice with backspace", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const state = backspace(typed(EN, "1030p"));
    expect(state.buffer.text).toBe("10:30 __");
    expect(state.buffer.selection.head).toBe(PERIOD_START);
  });

  it("clears the whole choice with delete", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const at = setSelection(typed(EN, "1030p"), PERIOD_START);
    expect(deleteForward(at).buffer.text).toBe("10:30 __");
  });

  it("clears a choice the selection touches", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const selected = setSelection(
      typed(EN, "1030p"),
      LAST_MINUTE_DIGIT,
      PERIOD_START + ONE
    );
    expect(backspace(selected).buffer.text).toBe("10:3_ __");
  });
});

describe("filling a choice", () => {
  it("pastes a time with its period", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const state = paste(createInputState({ mask: EN }), "10:30 pm");
    expect(state.buffer.text).toBe("10:30 PM");
  });

  it("starts from a value", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(createInputState({ mask: EN, value: "10:30 PM" }).buffer.text).toBe(
      "10:30 PM"
    );
    expect(createInputState({ mask: EN, value: "1030pm" }).buffer.text).toBe(
      "10:30 PM"
    );
  });
});
