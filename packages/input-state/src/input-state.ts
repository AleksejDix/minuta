/**
 * Input state: what is typed into (text buffer), how (mode) and under which
 * rules (mask). The mode is input state, not text state — like the Insert key
 * in an editor.
 *
 * With a mask the text always has the full template length; typing overwrites
 * the next slot and deleting writes the placeholder, so nothing ever shifts.
 * Masked inputs are always in overwrite mode. Without a mask the mode decides
 * between inserting and overwriting.
 */

import {
  backspaceInMask,
  deleteForwardInMask,
  firstEmptySlot,
  maskedText,
  setChar,
  typeIntoMask,
} from "./masked-edit";
import {
  createTextBuffer,
  deleteBackward,
  deleteForward as deleteForwardText,
  insertText,
  isCollapsed,
  select,
} from "text-buffer";
import type { Mask } from "./mask";
import type { TextBuffer } from "text-buffer";
import { slotPositions } from "./mask";

type Mode = "insert" | "overwrite";

type InputState = Readonly<{
  buffer: TextBuffer;
  mask: Mask | undefined;
  mode: Mode;
}>;

type InputOptions = Readonly<{
  mask?: Mask | undefined;
  mode?: Mode | undefined;
  value?: string | undefined;
}>;

function withBuffer(state: InputState, buffer: TextBuffer): InputState {
  if (buffer === state.buffer) {
    return state;
  }
  return { buffer, mask: state.mask, mode: state.mode };
}

/**
 * Create an input state. A masked input starts in overwrite mode with the
 * template filled from `value`; a free-text input starts in insert mode.
 *
 * @param options - Mask, mode and initial value
 * @returns The new state
 */
function createInputState(options: InputOptions = {}): InputState {
  const { mask, value = "" } = options;
  if (mask === undefined) {
    return {
      buffer: createTextBuffer(value),
      mask,
      mode: options.mode ?? "insert",
    };
  }
  const text = maskedText(mask, value);
  const cursor = firstEmptySlot(mask, text);
  return {
    buffer: createTextBuffer(text, { anchor: cursor, head: cursor }),
    mask,
    mode: "overwrite",
  };
}

/**
 * Set the selection; omit `head` for a collapsed cursor.
 *
 * @param state - State to change
 * @param anchor - Fixed end of the selection
 * @param head - Moving end of the selection
 * @returns The new state, or the same state when nothing changes
 */
function setSelection(
  state: InputState,
  anchor: number,
  head: number = anchor
): InputState {
  return withBuffer(state, select(state.buffer, anchor, head));
}

function typeFree(state: InputState, char: string): InputState {
  const { buffer } = state;
  const { head } = buffer.selection;
  if (
    state.mode === "overwrite" &&
    isCollapsed(buffer) &&
    head < buffer.text.length
  ) {
    return withBuffer(state, setChar(buffer, head, char));
  }
  return withBuffer(state, insertText(buffer, char));
}

/**
 * Type one character at the cursor.
 *
 * @param state - State to change
 * @param char - Typed character
 * @returns The new state, or the same state when the character is rejected
 */
function typeChar(state: InputState, char: string): InputState {
  if (state.mask === undefined) {
    return typeFree(state, char);
  }
  return withBuffer(state, typeIntoMask(state.buffer, state.mask, char));
}

/**
 * Backspace. With a mask the previous slot (or the selection) becomes the
 * placeholder and nothing shifts.
 *
 * @param state - State to change
 * @returns The new state, or the same state when there is nothing to delete
 */
function backspace(state: InputState): InputState {
  if (state.mask === undefined) {
    return withBuffer(state, deleteBackward(state.buffer));
  }
  return withBuffer(state, backspaceInMask(state.buffer, state.mask));
}

/**
 * Delete key. With a mask the slot at the cursor (or the selection) becomes
 * the placeholder and the cursor stays.
 *
 * @param state - State to change
 * @returns The new state, or the same state when there is nothing to delete
 */
function deleteForward(state: InputState): InputState {
  if (state.mask === undefined) {
    return withBuffer(state, deleteForwardText(state.buffer));
  }
  return withBuffer(state, deleteForwardInMask(state.buffer, state.mask));
}

/**
 * Paste text. With a mask the characters are distributed over the slots and
 * characters a slot does not accept are skipped.
 *
 * @param state - State to change
 * @param text - Pasted text
 * @returns The new state
 */
function paste(state: InputState, text: string): InputState {
  if (state.mask === undefined) {
    return withBuffer(state, insertText(state.buffer, text));
  }
  let next = state;
  for (const char of text) {
    next = typeChar(next, char);
  }
  return next;
}

/**
 * Switch between insert and overwrite. Masked inputs always overwrite.
 *
 * @param state - State to change
 * @returns The new state, or the same state for a masked input
 */
function toggleMode(state: InputState): InputState {
  if (state.mask !== undefined) {
    return state;
  }
  if (state.mode === "insert") {
    return { buffer: state.buffer, mask: state.mask, mode: "overwrite" };
  }
  return { buffer: state.buffer, mask: state.mask, mode: "insert" };
}

/**
 * Whether every slot of a masked input is filled (always true without a mask).
 *
 * @param state - State to inspect
 * @returns Whether the input is complete
 */
function isComplete(state: InputState): boolean {
  const { mask } = state;
  if (mask === undefined) {
    return true;
  }
  return slotPositions(mask).every(
    (slot) => state.buffer.text[slot] !== mask.placeholder
  );
}

export {
  backspace,
  createInputState,
  deleteForward,
  isComplete,
  paste,
  setSelection,
  toggleMode,
  typeChar,
};
export type { InputOptions, InputState, Mode };
