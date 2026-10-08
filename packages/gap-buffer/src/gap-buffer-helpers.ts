// Pure slot helpers for GapBuffer

const GAP = " ";
const FIRST_SLOT = 0;
const STEP = 1;

type Slot = string | undefined;

type PasteInput = {
  readonly accepts: (char: string) => boolean;
  readonly index: number;
  readonly maxLength: number;
  readonly slots: readonly Slot[];
  readonly text: string;
};

type PasteResult = {
  readonly cursor: number;
  readonly slots: readonly Slot[];
};

function slotsEqual(left: readonly Slot[], right: readonly Slot[]): boolean {
  if (left === right) {
    return true;
  }
  if (left.length !== right.length) {
    return false;
  }
  return left.every((slot, idx) => slot === right[idx]);
}

function parseValue(value: string, maxLength: number): Slot[] {
  const slots: Slot[] = [];
  for (let idx = FIRST_SLOT; idx < maxLength; idx += STEP) {
    const ch = value[idx];
    if (ch === undefined || ch === GAP) {
      slots.push(undefined);
    } else {
      slots.push(ch);
    }
  }
  return slots;
}

function clamp(num: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, num));
}

function normalizePattern(
  pattern: string | Readonly<RegExp> | undefined
): RegExp | undefined {
  if (pattern === undefined || pattern === "") {
    return undefined;
  }
  if (typeof pattern === "string") {
    // oxlint-disable-next-line eslint/require-unicode-regexp -- User-supplied pattern; the u flag would change its syntax and meaning
    return new RegExp(pattern);
  }
  if (!/[gy]/u.test(pattern.flags)) {
    return pattern;
  }
  return new RegExp(pattern.source, pattern.flags.replaceAll(/[gy]/gu, ""));
}

function pasteSlots(input: PasteInput): PasteResult {
  const { accepts, index, maxLength, text } = input;
  const slots = [...input.slots];
  let cursor = index;
  for (const ch of text) {
    if (cursor >= maxLength) {
      break;
    }
    if (accepts(ch)) {
      slots[cursor] = ch;
      cursor += STEP;
    }
  }
  return { cursor, slots };
}

function isFilled(slot: Slot): boolean {
  return slot !== undefined && slot !== "";
}

export {
  FIRST_SLOT,
  GAP,
  STEP,
  clamp,
  isFilled,
  normalizePattern,
  parseValue,
  pasteSlots,
  slotsEqual,
};
export type { Slot };
