/**
 * GapBuffer
 * =========
 *
 * Fixed-capacity, immutable buffer of N slots (a slot is `string` or `undefined`),
 * plus a cursor pointing at the slot currently in focus. Every mutation returns
 * a new `GapBuffer` — React treats it as a value, not a mutable structure.
 *
 * "Gap buffer" in the classic text-editor sense models the cursor as a gap in
 * an array; here, the cursor is the slot the user is currently editing and the
 * "gap" is the (possibly empty) slot at that position. Inserting fills the
 * cursor slot and advances; Backspace shrinks back, mirroring a real editor.
 *
 * No React, no DOM — pure data. Suitable for unit testing in isolation.
 */

import {
  FIRST_SLOT,
  GAP,
  STEP,
  clamp,
  isFilled,
  normalizePattern,
  parseValue,
  pasteSlots,
  slotsEqual,
} from "./gap-buffer-helpers";
import type { Slot } from "./gap-buffer-helpers";

const REGEXP_ONLY_DIGITS: string = String.raw`^\d+$`;

const NOT_FOUND = -1;

type GapBufferInternals = {
  readonly slots: readonly Slot[];
  readonly cursor: number;
  readonly maxLength: number;
  readonly pattern?: Readonly<RegExp> | undefined;
};

type GapBufferOptions = {
  maxLength: number;
  value?: string | undefined;
  cursor?: number | undefined;
  pattern?: string | RegExp | undefined;
};

/**
 * Constructor input that is not mutated while the buffer is built.
 */
type ReadonlyGapBufferOptions = {
  readonly maxLength: number;
  readonly value?: string | undefined;
  readonly cursor?: number | undefined;
  readonly pattern?: string | Readonly<RegExp> | undefined;
};

function toInternals(
  options: ReadonlyGapBufferOptions | GapBufferInternals
): GapBufferInternals {
  if ("slots" in options) {
    return options;
  }
  const { maxLength, value = "", cursor = FIRST_SLOT, pattern } = options;
  return {
    cursor: clamp(cursor, FIRST_SLOT, maxLength - STEP),
    maxLength,
    pattern: normalizePattern(pattern),
    slots: parseValue(value, maxLength),
  };
}

class GapBuffer {
  public readonly slots: readonly Slot[];
  public readonly cursor: number;
  public readonly maxLength: number;
  public readonly pattern?: RegExp | undefined;

  public constructor(options: ReadonlyGapBufferOptions | GapBufferInternals) {
    const internals = toInternals(options);
    this.slots = internals.slots;
    this.cursor = internals.cursor;
    this.maxLength = internals.maxLength;
    this.pattern = internals.pattern;
  }

  /**
   * True iff every slot is filled.
   *
   * @returns Whether every slot is filled
   */
  public get isComplete(): boolean {
    return (
      this.slots.length === this.maxLength &&
      this.slots.every((slot) => slot !== undefined)
    );
  }

  /**
   * True iff `char` is permitted by the pattern (or there is no pattern).
   *
   * @param char - Character to check
   * @returns Whether the character is accepted
   */
  public accepts(char: string): boolean {
    return this.pattern === undefined || this.pattern.test(char);
  }

  /**
   * Write `char` at `index`. Advances the cursor by one (clamped to maxLength-1)
   * unless `char` is empty (in which case the slot is cleared and the cursor stays).
   * Returns `this` (same identity) when no change occurs — useful for React equality checks.
   *
   * @param index - Slot to write
   * @param char - Character to write, or "" to clear
   * @returns The new buffer, or `this` when nothing changes
   */
  public insertAt(index: number, char: string): GapBuffer {
    if (!this.isInRange(index) || (char !== "" && !this.accepts(char))) {
      return this;
    }
    if (char === "") {
      return this.clearedIfFilled(index);
    }
    const cursor = Math.min(index + STEP, this.lastSlot());
    if (this.slots[index] === char && this.cursor === cursor) {
      return this;
    }
    const slots = [...this.slots];
    slots[index] = char;
    return this.with(slots, cursor);
  }

  /**
   * Backspace at `index`:
   *  - filled slot → clear it, cursor stays
   *  - empty slot → clear the previous slot, cursor retreats
   *  - empty slot at index 0 → no-op
   *
   * @param index - Slot the cursor is on
   * @returns The new buffer, or `this` when nothing changes
   */
  public backspaceAt(index: number): GapBuffer {
    if (!this.isInRange(index)) {
      return this;
    }
    if (isFilled(this.slots[index])) {
      return this.cleared(index, index);
    }
    if (index === FIRST_SLOT) {
      return this;
    }
    return this.cleared(index - STEP, index - STEP);
  }

  /**
   * Distribute `text` across slots starting at `index`, skipping chars that fail
   * the pattern. Cursor advances to the slot after the last char written (clamped).
   *
   * @param index - First slot to write
   * @param text - Pasted text
   * @returns The new buffer, or `this` when no char was written
   */
  public pasteAt(index: number, text: string): GapBuffer {
    if (!this.isInRange(index)) {
      return this;
    }
    const { cursor, slots } = pasteSlots({
      accepts: (char) => this.accepts(char),
      index,
      maxLength: this.maxLength,
      slots: this.slots,
      text,
    });
    if (cursor === index) {
      return this;
    }
    return this.with(slots, Math.min(cursor, this.lastSlot()));
  }

  /**
   * Move the cursor to a specific slot (clamped).
   *
   * @param index - Slot to focus
   * @returns The new buffer, or `this` when the cursor does not move
   */
  public focus(index: number): GapBuffer {
    const cursor = clamp(index, FIRST_SLOT, this.lastSlot());
    if (cursor === this.cursor) {
      return this;
    }
    return this.with(this.slots, cursor);
  }

  /**
   * Replace the buffer's contents from a serialized string. Cursor lands on the
   * first empty slot (or the last slot when the value fills everything).
   *
   * @param value - Serialized value (gaps as spaces)
   * @returns The new buffer, or `this` when the slots do not change
   */
  public setValue(value: string): GapBuffer {
    const slots = parseValue(value, this.maxLength);
    if (slotsEqual(slots, this.slots)) {
      return this;
    }
    const firstEmpty = slots.findIndex((slot) => !isFilled(slot));
    if (firstEmpty === NOT_FOUND) {
      return this.with(slots, this.lastSlot());
    }
    return this.with(slots, firstEmpty);
  }

  /**
   * Serialize: gaps render as space, trailing gaps are stripped.
   *
   * @returns The serialized value
   */
  public toString(): string {
    return this.slots
      .map((slot) => slot ?? GAP)
      .join("")
      .replace(/ +$/u, "");
  }

  private lastSlot(): number {
    return this.maxLength - STEP;
  }

  private isInRange(index: number): boolean {
    return index >= FIRST_SLOT && index < this.maxLength;
  }

  private clearedIfFilled(index: number): GapBuffer {
    if (this.slots[index] === undefined) {
      return this;
    }
    return this.cleared(index, index);
  }

  private cleared(index: number, cursor: number): GapBuffer {
    const slots = [...this.slots];
    slots[index] = undefined;
    return this.with(slots, cursor);
  }

  private with(slots: readonly Slot[], cursor: number): GapBuffer {
    return new GapBuffer({
      cursor,
      maxLength: this.maxLength,
      pattern: this.pattern,
      slots,
    });
  }
}

export { GapBuffer, REGEXP_ONLY_DIGITS };
export { GAP } from "./gap-buffer-helpers";
export type { GapBufferOptions };
export type { Slot } from "./gap-buffer-helpers";
