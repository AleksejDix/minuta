// Buffer edits under a mask: overwrite slots, never shift, skip literals

import { choiceAt, choiceIn, clearChoice, writeChoice } from "./choice";
import {
  createTextBuffer,
  replaceRange,
  select,
  selectionEnd,
  selectionStart,
} from "@aleksejdix/text-buffer";
import { emptyText, slotChar, slotPositions } from "./mask";
import type { ChoiceSpan } from "./choice";
import type { Mask } from "./mask";
import type { TextBuffer } from "@aleksejdix/text-buffer";

const NOT_FOUND = -1;
const START = 0;
const ONE = 1;

function slotAtOrAfter(mask: Mask, position: number): number {
  return slotPositions(mask).find((slot) => slot >= position) ?? NOT_FOUND;
}

function slotBefore(mask: Mask, position: number): number {
  let found = NOT_FOUND;
  for (const slot of slotPositions(mask)) {
    if (slot < position) {
      found = slot;
    }
  }
  return found;
}

function firstEmptySlot(mask: Mask, text: string): number {
  return (
    slotPositions(mask).find((slot) => text[slot] === mask.placeholder) ??
    text.length
  );
}

function setChar(
  buffer: TextBuffer,
  position: number,
  char: string
): TextBuffer {
  return replaceRange(buffer, { from: position, to: position + ONE }, char);
}

/**
 * The character slot `slot` stores for `char`, if it accepts it.
 *
 * @param mask - The mask
 * @param slot - Position of the slot
 * @param char - Typed character
 * @returns The character to store, or undefined
 */
function storedAt(
  mask: Mask,
  slot: number | undefined,
  char: string
): string | undefined {
  if (slot === undefined) {
    return undefined;
  }
  const token = mask.tokens[slot];
  if (token === undefined || token.kind !== "slot") {
    return undefined;
  }
  return slotChar(token.accepts, char);
}

// A value already in template form: same length, literals in place
function fitsTemplate(mask: Mask, value: string): boolean {
  return (
    value.length === mask.tokens.length &&
    mask.tokens.every(
      (token, position) =>
        token.kind !== "literal" || value.charAt(position) === token.char
    )
  );
}

// Empty a slot, or the whole choice it belongs to
function clearAt(buffer: TextBuffer, mask: Mask, slot: number): TextBuffer {
  const span = choiceAt(mask, slot);
  if (span === undefined) {
    return setChar(buffer, slot, mask.placeholder);
  }
  return clearChoice(buffer, mask, span);
}

// A selection that starts inside a choice starts at the choice
function clearedFrom(mask: Mask, from: number): number {
  const span = choiceAt(mask, from);
  if (span === undefined) {
    return from;
  }
  return span.from;
}

function clearSelectedSlots(buffer: TextBuffer, mask: Mask): TextBuffer {
  const from = selectionStart(buffer);
  const to = selectionEnd(buffer);
  let next = buffer;
  for (const slot of slotPositions(mask)) {
    if (slot >= from && slot < to) {
      next = clearAt(next, mask, slot);
    }
  }
  return select(next, clearedFrom(mask, from));
}

type Typed = Readonly<{ after: number; written: TextBuffer }>;

// `char` typed into the choice the cursor is on
function typedChoice(
  buffer: TextBuffer,
  span: ChoiceSpan,
  char: string
): Typed | undefined {
  const written = writeChoice(buffer, span, char);
  if (written === undefined) {
    return undefined;
  }
  return { after: span.to, written };
}

// `char` typed into the plain slot at `slot`
function typedSlot(
  buffer: TextBuffer,
  mask: Mask,
  at: Readonly<{ char: string; slot: number }>
): Typed | undefined {
  const stored = storedAt(mask, at.slot, at.char);
  if (stored === undefined) {
    return undefined;
  }
  return { after: at.slot + ONE, written: setChar(buffer, at.slot, stored) };
}

// The buffer with `char` typed at the cursor's slot, and the position after
function writtenAt(
  buffer: TextBuffer,
  mask: Mask,
  char: string
): Typed | undefined {
  const slot = slotAtOrAfter(mask, buffer.selection.head);
  if (slot === NOT_FOUND) {
    return undefined;
  }
  const span = choiceAt(mask, slot);
  if (span !== undefined) {
    return typedChoice(buffer, span, char);
  }
  return typedSlot(buffer, mask, { char, slot });
}

// The cursor on the next slot after what was typed, or at the end
function onNextSlot(mask: Mask, typed: Typed): TextBuffer {
  const next = slotAtOrAfter(mask, typed.after);
  if (next === NOT_FOUND) {
    return select(typed.written, typed.written.text.length);
  }
  return select(typed.written, next);
}

function typeIntoMask(
  buffer: TextBuffer,
  mask: Mask,
  char: string
): TextBuffer {
  const typed = writtenAt(clearSelectedSlots(buffer, mask), mask, char);
  if (typed === undefined) {
    return buffer;
  }
  return onNextSlot(mask, typed);
}

// Fill the value in slot by slot like a paste, skipping rejected characters
function filledText(mask: Mask, value: string): string {
  let buffer = select(createTextBuffer(emptyText(mask)), START);
  for (const char of value) {
    buffer = typeIntoMask(buffer, mask, char);
  }
  return buffer.text;
}

// What a choice position shows for a value already in template form
function templateChoiceChar(
  mask: Mask,
  value: string,
  position: number
): string {
  const span = choiceAt(mask, position);
  if (span === undefined) {
    return mask.placeholder;
  }
  const shown = choiceIn(span, value);
  if (shown === undefined) {
    return mask.placeholder;
  }
  return shown.charAt(position - span.from);
}

/**
 * The text of a masked field holding `value`: taken position by position
 * when it already matches the template, otherwise filled in slot by slot,
 * so "31032026", "31.03.2026" and a value without the format's invisible
 * marks all give the same text.
 *
 * @param mask - The mask
 * @param value - The initial value
 * @returns The field text
 */
function maskedText(mask: Mask, value: string): string {
  if (!fitsTemplate(mask, value)) {
    return filledText(mask, value);
  }
  return mask.tokens
    .map((token, position) => {
      if (token.kind === "literal") {
        return token.char;
      }
      if (token.kind === "choice") {
        return templateChoiceChar(mask, value, position);
      }
      return (
        slotChar(token.accepts, value.charAt(position)) ?? mask.placeholder
      );
    })
    .join("");
}

function backspaceInMask(buffer: TextBuffer, mask: Mask): TextBuffer {
  if (selectionStart(buffer) !== selectionEnd(buffer)) {
    return clearSelectedSlots(buffer, mask);
  }
  const slot = slotBefore(mask, buffer.selection.head);
  if (slot === NOT_FOUND) {
    return buffer;
  }
  return select(clearAt(buffer, mask, slot), clearedFrom(mask, slot));
}

function deleteForwardInMask(buffer: TextBuffer, mask: Mask): TextBuffer {
  if (selectionStart(buffer) !== selectionEnd(buffer)) {
    return clearSelectedSlots(buffer, mask);
  }
  const { head } = buffer.selection;
  const slot = slotAtOrAfter(mask, head);
  if (slot === NOT_FOUND) {
    return buffer;
  }
  return select(clearAt(buffer, mask, slot), head);
}

export {
  backspaceInMask,
  deleteForwardInMask,
  firstEmptySlot,
  maskedText,
  setChar,
  typeIntoMask,
};
