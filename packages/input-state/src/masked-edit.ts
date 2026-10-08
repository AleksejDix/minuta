// Buffer edits under a mask: overwrite slots, never shift, skip literals

import { accepts, slotPositions } from "./mask";
import {
  replaceRange,
  select,
  selectionEnd,
  selectionStart,
} from "text-buffer";
import type { Mask } from "./mask";
import type { TextBuffer } from "text-buffer";

const NOT_FOUND = -1;
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

function maskedText(mask: Mask, value: string): string {
  return mask.tokens
    .map((token, position) => {
      if (token.kind === "literal") {
        return token.char;
      }
      const char = value.charAt(position);
      if (accepts(token.accepts, char)) {
        return char;
      }
      return mask.placeholder;
    })
    .join("");
}

function clearSelectedSlots(buffer: TextBuffer, mask: Mask): TextBuffer {
  const from = selectionStart(buffer);
  const to = selectionEnd(buffer);
  let next = buffer;
  for (const slot of slotPositions(mask)) {
    if (slot >= from && slot < to) {
      next = setChar(next, slot, mask.placeholder);
    }
  }
  return select(next, from);
}

function typeIntoMask(
  buffer: TextBuffer,
  mask: Mask,
  char: string
): TextBuffer {
  const cleared = clearSelectedSlots(buffer, mask);
  const slot = slotAtOrAfter(mask, cleared.selection.head);
  const token = mask.tokens[slot];
  if (
    token === undefined ||
    token.kind !== "slot" ||
    !accepts(token.accepts, char)
  ) {
    return buffer;
  }
  const written = setChar(cleared, slot, char);
  const next = slotAtOrAfter(mask, slot + ONE);
  if (next === NOT_FOUND) {
    return select(written, written.text.length);
  }
  return select(written, next);
}

function backspaceInMask(buffer: TextBuffer, mask: Mask): TextBuffer {
  if (selectionStart(buffer) !== selectionEnd(buffer)) {
    return clearSelectedSlots(buffer, mask);
  }
  const slot = slotBefore(mask, buffer.selection.head);
  if (slot === NOT_FOUND) {
    return buffer;
  }
  return select(setChar(buffer, slot, mask.placeholder), slot);
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
  return select(setChar(buffer, slot, mask.placeholder), head);
}

export {
  backspaceInMask,
  deleteForwardInMask,
  firstEmptySlot,
  maskedText,
  setChar,
  typeIntoMask,
};
