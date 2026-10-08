import { describe, expect, it } from "vitest";
import { GapBuffer, REGEXP_ONLY_DIGITS } from "./gap-buffer";

const buf = (
  value = "",
  maxLength = 6,
  pattern?: string | RegExp,
  cursor = 0
) => new GapBuffer({ maxLength, value, pattern, cursor });

describe("GapBuffer", () => {
  describe("construction", () => {
    it("parses value into slots and clamps the cursor", () => {
      const b = buf("12", 6, undefined, 99);
      expect(b.slots).toEqual([
        "1",
        "2",
        undefined,
        undefined,
        undefined,
        undefined,
      ]);
      expect(b.cursor).toBe(5);
    });

    it("treats space as a gap (undefined), not a literal char", () => {
      expect(buf("a c").slots.slice(0, 3)).toEqual(["a", undefined, "c"]);
    });
  });

  describe("insertAt", () => {
    it("writes the char and advances the cursor", () => {
      const b = buf().insertAt(0, "1");
      expect(b.slots[0]).toBe("1");
      expect(b.cursor).toBe(1);
    });

    it("overwrites an existing char and still advances", () => {
      const b = buf("9").insertAt(0, "1");
      expect(b.slots[0]).toBe("1");
      expect(b.cursor).toBe(1);
    });

    it("clamps cursor at the last slot", () => {
      const b = buf("12345", 6).insertAt(5, "6");
      expect(b.slots[5]).toBe("6");
      expect(b.cursor).toBe(5);
    });

    it("rejects a char that does not match the pattern", () => {
      const before = buf("", 6, REGEXP_ONLY_DIGITS);
      const after = before.insertAt(0, "a");
      expect(after).toBe(before);
    });

    it("returns the same instance when nothing changes", () => {
      const before = buf("1", 6, undefined, 1);
      expect(before.insertAt(0, "1")).toBe(before);
    });
  });

  describe("accepts", () => {
    it("accepts any char when no pattern is set", () => {
      expect(buf().accepts("a")).toBe(true);
      expect(buf().accepts("9")).toBe(true);
    });

    it("returns true for chars matching the pattern", () => {
      expect(buf("", 6, REGEXP_ONLY_DIGITS).accepts("1")).toBe(true);
    });

    it("returns false for chars rejected by the pattern", () => {
      expect(buf("", 6, REGEXP_ONLY_DIGITS).accepts("a")).toBe(false);
    });
  });

  describe("backspaceAt", () => {
    it("clears a filled slot and stays put", () => {
      const b = buf("123").backspaceAt(2);
      expect(b.slots[2]).toBeUndefined();
      expect(b.cursor).toBe(2);
    });

    it("on an empty slot, clears the previous slot and retreats", () => {
      const b = buf("12").backspaceAt(2);
      expect(b.slots[1]).toBeUndefined();
      expect(b.cursor).toBe(1);
    });

    it("is a no-op at index 0 when the slot is empty", () => {
      const before = buf("");
      const after = before.backspaceAt(0);
      expect(after).toBe(before);
    });

    it("handles two consecutive backspaces on the same index (rapid-Backspace scenario)", () => {
      // This is the bug React's stale closure can't see: dispatching two backspaces
      // at index 2 before any re-render should still clear slot 2, then slot 1.
      const b = buf("abc").backspaceAt(2).backspaceAt(2);
      expect(b.slots[2]).toBeUndefined();
      expect(b.slots[1]).toBeUndefined();
      expect(b.slots[0]).toBe("a");
      expect(b.cursor).toBe(1);
    });
  });

  describe("pasteAt", () => {
    it("distributes chars starting from the index and lands the cursor on the next empty slot", () => {
      const b = buf().pasteAt(0, "1234");
      expect(b.slots.slice(0, 4)).toEqual(["1", "2", "3", "4"]);
      expect(b.cursor).toBe(4);
    });

    it("skips chars that fail the pattern", () => {
      const b = buf("", 6, REGEXP_ONLY_DIGITS).pasteAt(0, "1a2b3");
      expect(b.slots.slice(0, 3)).toEqual(["1", "2", "3"]);
    });

    it("stops at maxLength", () => {
      const b = buf("", 4).pasteAt(0, "1234567");
      expect(b.slots).toEqual(["1", "2", "3", "4"]);
      expect(b.cursor).toBe(3);
    });

    it("returns the same instance when nothing gets written", () => {
      const before = buf("", 6, REGEXP_ONLY_DIGITS);
      const after = before.pasteAt(0, "abc");
      expect(after).toBe(before);
    });
  });

  describe("focus", () => {
    it("moves the cursor to the requested index", () => {
      expect(buf().focus(3).cursor).toBe(3);
    });

    it("clamps out-of-range values", () => {
      expect(buf().focus(-1).cursor).toBe(0);
      expect(buf().focus(999).cursor).toBe(5);
    });

    it("returns the same instance when the cursor doesn't move", () => {
      const before = buf("", 6, undefined, 3);
      expect(before.focus(3)).toBe(before);
    });
  });

  describe("setValue", () => {
    it("replaces the slots and lands the cursor on the first empty slot", () => {
      const b = buf("", 6, undefined, 4).setValue("ab");
      expect(b.slots[0]).toBe("a");
      expect(b.slots[1]).toBe("b");
      expect(b.cursor).toBe(2);
    });

    it("lands the cursor at index 0 when clearing the value", () => {
      const b = buf("12345", 6, undefined, 4).setValue("");
      expect(b.cursor).toBe(0);
    });

    it("lands the cursor on the last slot when the value fills everything", () => {
      const b = buf("", 6).setValue("123456");
      expect(b.cursor).toBe(5);
    });

    it("is a no-op when the value already matches", () => {
      const before = buf("ab");
      expect(before.setValue("ab")).toBe(before);
    });
  });

  describe("toString", () => {
    it("emits gaps as spaces and trims trailing gaps", () => {
      expect(buf().insertAt(4, "9").toString()).toBe("    9");
    });

    it("returns empty for an all-empty buffer", () => {
      expect(buf().toString()).toBe("");
    });
  });

  describe("isComplete", () => {
    it("is true only when every slot is filled", () => {
      expect(buf("123456").isComplete).toBe(true);
      expect(buf("12345").isComplete).toBe(false);
      expect(buf("  3456").isComplete).toBe(false);
    });
  });
});
