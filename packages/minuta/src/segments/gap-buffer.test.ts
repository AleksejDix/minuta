import { GapBuffer, REGEXP_ONLY_DIGITS } from "./gap-buffer";
import { describe, expect, it } from "vitest";

const DEFAULT_MAX_LENGTH = 6;
const FIRST_SLOT = 0;
const SECOND_SLOT = 1;
const THIRD_SLOT = 2;
const LAST_SLOT = 5;

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

describe("gap buffer construction", () => {
  it("parses value into slots and clamps the cursor", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const buffer = buf({ cursor: 99, maxLength: 6, value: "12" });
    expect(buffer.slots).toStrictEqual([
      "1",
      "2",
      undefined,
      undefined,
      undefined,
      undefined,
    ]);
    expect(buffer.cursor).toBe(LAST_SLOT);
  });

  it(
    "treats space as a gap (undefined), not a literal char",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const [first, second, third] = buf({ value: "a c" }).slots;
      expect([first, second, third]).toStrictEqual(["a", undefined, "c"]);
    }
  );
});

describe("gap buffer insertAt()", () => {
  it("writes the char and advances the cursor", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const buffer = buf().insertAt(FIRST_SLOT, "1");
    const [first] = buffer.slots;
    expect(first).toBe("1");
    expect(buffer.cursor).toBe(SECOND_SLOT);
  });

  it(
    "overwrites an existing char and still advances",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const buffer = buf({ value: "9" }).insertAt(FIRST_SLOT, "1");
      const [first] = buffer.slots;
      expect(first).toBe("1");
      expect(buffer.cursor).toBe(SECOND_SLOT);
    }
  );

  it("clamps cursor at the last slot", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const buffer = buf({ maxLength: 6, value: "12345" }).insertAt(
      LAST_SLOT,
      "6"
    );
    expect(buffer.slots[LAST_SLOT]).toBe("6");
    expect(buffer.cursor).toBe(LAST_SLOT);
  });
});

describe("gap buffer insertAt() without changes", () => {
  it(
    "rejects a char that does not match the pattern",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const before = buf({ maxLength: 6, pattern: REGEXP_ONLY_DIGITS });
      const after = before.insertAt(FIRST_SLOT, "a");
      expect(after).toBe(before);
    }
  );

  it(
    "returns the same instance when nothing changes",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const before = buf({ cursor: 1, maxLength: 6, value: "1" });
      expect(before.insertAt(FIRST_SLOT, "1")).toBe(before);
    }
  );
});

describe("gap buffer accepts()", () => {
  it("accepts any char when no pattern is set", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(buf().accepts("a")).toBe(true);
    expect(buf().accepts("9")).toBe(true);
  });

  it("returns true for chars matching the pattern", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(
      buf({ maxLength: 6, pattern: REGEXP_ONLY_DIGITS }).accepts("1")
    ).toBe(true);
  });

  it(
    "returns false for chars rejected by the pattern",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      expect(
        buf({ maxLength: 6, pattern: REGEXP_ONLY_DIGITS }).accepts("a")
      ).toBe(false);
    }
  );
});

describe("gap buffer backspaceAt()", () => {
  it("clears a filled slot and stays put", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const buffer = buf({ value: "123" }).backspaceAt(THIRD_SLOT);
    expect(buffer.slots[THIRD_SLOT]).toBeUndefined();
    expect(buffer.cursor).toBe(THIRD_SLOT);
  });

  it(
    "on an empty slot, clears the previous slot and retreats",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const buffer = buf({ value: "12" }).backspaceAt(THIRD_SLOT);
      expect(buffer.slots[SECOND_SLOT]).toBeUndefined();
      expect(buffer.cursor).toBe(SECOND_SLOT);
    }
  );

  it("is a no-op at index 0 when the slot is empty", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const before = buf({ value: "" });
    const after = before.backspaceAt(FIRST_SLOT);
    expect(after).toBe(before);
  });

  it(
    "handles two consecutive backspaces on the same index (rapid-Backspace scenario)",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      /*
       * This is the bug React's stale closure can't see: dispatching two backspaces
       * at index 2 before any re-render should still clear slot 2, then slot 1.
       */
      const buffer = buf({ value: "abc" })
        .backspaceAt(THIRD_SLOT)
        .backspaceAt(THIRD_SLOT);
      expect(buffer.slots[THIRD_SLOT]).toBeUndefined();
      expect(buffer.slots[SECOND_SLOT]).toBeUndefined();
      expect(buffer.slots[FIRST_SLOT]).toBe("a");
      expect(buffer.cursor).toBe(SECOND_SLOT);
    }
  );
});
