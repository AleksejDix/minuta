import { GapBuffer, REGEXP_ONLY_DIGITS } from "./gap-buffer";
import { describe, expect, it } from "vitest";

const DEFAULT_MAX_LENGTH = 6;
const FIRST_SLOT = 0;
const SECOND_SLOT = 1;
const THIRD_SLOT = 2;
const FOURTH_SLOT = 3;
const FIFTH_SLOT = 4;
const LAST_SLOT = 5;
const BEFORE_FIRST_SLOT = -1;
const FAR_OUT_OF_RANGE = 999;

type BufferInput = {
  readonly cursor?: number;
  readonly maxLength?: number;
  readonly pattern?: string | Readonly<RegExp>;
  readonly value?: string;
};

function buf(input: BufferInput = {}): GapBuffer {
  const {
    cursor = FIRST_SLOT,
    maxLength = DEFAULT_MAX_LENGTH,
    pattern,
    value = "",
  } = input;
  return new GapBuffer({ cursor, maxLength, pattern, value });
}

describe("gap buffer pasteAt()", () => {
  it(
    "distributes chars starting from the index and lands the cursor on the next empty slot",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const buffer = buf().pasteAt(FIRST_SLOT, "1234");
      const [first, second, third, fourth] = buffer.slots;
      expect([first, second, third, fourth]).toStrictEqual([
        "1",
        "2",
        "3",
        "4",
      ]);
      expect(buffer.cursor).toBe(FIFTH_SLOT);
    }
  );

  it("skips chars that fail the pattern", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const buffer = buf({ maxLength: 6, pattern: REGEXP_ONLY_DIGITS }).pasteAt(
      FIRST_SLOT,
      "1a2b3"
    );
    const [first, second, third] = buffer.slots;
    expect([first, second, third]).toStrictEqual(["1", "2", "3"]);
  });

  it("stops at maxLength", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const buffer = buf({ maxLength: 4 }).pasteAt(FIRST_SLOT, "1234567");
    expect(buffer.slots).toStrictEqual(["1", "2", "3", "4"]);
    expect(buffer.cursor).toBe(FOURTH_SLOT);
  });

  it(
    "returns the same instance when nothing gets written",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const before = buf({ maxLength: 6, pattern: REGEXP_ONLY_DIGITS });
      const after = before.pasteAt(FIRST_SLOT, "abc");
      expect(after).toBe(before);
    }
  );
});

describe("gap buffer focus()", () => {
  it("moves the cursor to the requested index", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(buf().focus(FOURTH_SLOT).cursor).toBe(FOURTH_SLOT);
  });

  it("clamps out-of-range values", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(buf().focus(BEFORE_FIRST_SLOT).cursor).toBe(FIRST_SLOT);
    expect(buf().focus(FAR_OUT_OF_RANGE).cursor).toBe(LAST_SLOT);
  });

  it(
    "returns the same instance when the cursor doesn't move",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const before = buf({ cursor: 3, maxLength: 6 });
      expect(before.focus(FOURTH_SLOT)).toBe(before);
    }
  );
});

describe("gap buffer setValue()", () => {
  it(
    "replaces the slots and lands the cursor on the first empty slot",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const buffer = buf({ cursor: 4, maxLength: 6 }).setValue("ab");
      expect(buffer.slots[FIRST_SLOT]).toBe("a");
      expect(buffer.slots[SECOND_SLOT]).toBe("b");
      expect(buffer.cursor).toBe(THIRD_SLOT);
    }
  );

  it(
    "lands the cursor at index 0 when clearing the value",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const buffer = buf({ cursor: 4, maxLength: 6, value: "12345" }).setValue(
        ""
      );
      expect(buffer.cursor).toBe(FIRST_SLOT);
    }
  );

  it(
    "lands the cursor on the last slot when the value fills everything",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const buffer = buf({ maxLength: 6 }).setValue("123456");
      expect(buffer.cursor).toBe(LAST_SLOT);
    }
  );

  it("is a no-op when the value already matches", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const before = buf({ value: "ab" });
    expect(before.setValue("ab")).toBe(before);
  });
});

describe("gap buffer toString()", () => {
  it("emits gaps as spaces and trims trailing gaps", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(buf().insertAt(FIFTH_SLOT, "9").toString()).toBe("    9");
  });

  it("returns empty for an all-empty buffer", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(buf().toString()).toBe("");
  });
});

describe("gap buffer isComplete", () => {
  it("is true only when every slot is filled", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(buf({ value: "123456" }).isComplete).toBe(true);
    expect(buf({ value: "12345" }).isComplete).toBe(false);
    expect(buf({ value: "  3456" }).isComplete).toBe(false);
  });
});
