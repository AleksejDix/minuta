/**
 * Text buffer
 * ===========
 *
 * Immutable text plus a selection. A cursor is a collapsed selection
 * (`anchor === head`). Positions are UTF-16 indices, the same unit the DOM uses
 * for `selectionStart` / `selectionEnd`.
 *
 * Every operation is a pure function that returns a new buffer, or the same
 * buffer when nothing changes. The buffer knows nothing about input modes,
 * masks or dates — those are layers on top.
 */

const START = 0;
const ONE = 1;

type Selection = Readonly<{
  anchor: number;
  head: number;
}>;

type Range = Readonly<{
  from: number;
  to: number;
}>;

type TextBuffer = Readonly<{
  selection: Selection;
  text: string;
}>;

function clamp(position: number, text: string): number {
  return Math.max(START, Math.min(text.length, position));
}

function collapsed(position: number): Selection {
  return { anchor: position, head: position };
}

/**
 * Lower edge of the selection.
 *
 * @param buffer - Buffer to inspect
 * @returns The smaller of anchor and head
 */
function selectionStart(buffer: TextBuffer): number {
  return Math.min(buffer.selection.anchor, buffer.selection.head);
}

/**
 * Upper edge of the selection.
 *
 * @param buffer - Buffer to inspect
 * @returns The larger of anchor and head
 */
function selectionEnd(buffer: TextBuffer): number {
  return Math.max(buffer.selection.anchor, buffer.selection.head);
}

function isCollapsed(buffer: TextBuffer): boolean {
  return buffer.selection.anchor === buffer.selection.head;
}

/**
 * Create a buffer.
 *
 * @param text - Initial text
 * @param selection - Initial selection; defaults to a cursor at the end
 * @returns A new buffer with the selection clamped into the text
 */
function createTextBuffer(text = "", selection?: Selection): TextBuffer {
  if (selection === undefined) {
    return { selection: collapsed(text.length), text };
  }
  return {
    selection: {
      anchor: clamp(selection.anchor, text),
      head: clamp(selection.head, text),
    },
    text,
  };
}

/**
 * Set the selection. Omit `head` for a collapsed cursor.
 *
 * @param buffer - Buffer to change
 * @param anchor - Fixed end of the selection
 * @param head - Moving end of the selection (defaults to anchor)
 * @returns The new buffer, or the same buffer when the selection is unchanged
 */
function select(
  buffer: TextBuffer,
  anchor: number,
  head: number = anchor
): TextBuffer {
  const next = {
    anchor: clamp(anchor, buffer.text),
    head: clamp(head, buffer.text),
  };
  if (
    next.anchor === buffer.selection.anchor &&
    next.head === buffer.selection.head
  ) {
    return buffer;
  }
  return { selection: next, text: buffer.text };
}

/**
 * Move the cursor by `offset`. A selection collapses to its start when moving
 * back and to its end when moving ahead, like arrow keys in a text field.
 *
 * @param buffer - Buffer to change
 * @param offset - Characters to move; negative moves back
 * @returns The new buffer, or the same buffer when the cursor does not move
 */
function moveCursor(buffer: TextBuffer, offset: number): TextBuffer {
  if (!isCollapsed(buffer)) {
    if (offset < START) {
      return select(buffer, selectionStart(buffer));
    }
    return select(buffer, selectionEnd(buffer));
  }
  return select(buffer, buffer.selection.head + offset);
}

/**
 * Replace `range` with `text` and put the cursor after the inserted text.
 *
 * @param buffer - Buffer to change
 * @param range - Range to replace (clamped into the text)
 * @param text - Replacement text
 * @returns The new buffer
 */
function replaceRange(
  buffer: TextBuffer,
  range: Range,
  text: string
): TextBuffer {
  const from = clamp(Math.min(range.from, range.to), buffer.text);
  const to = clamp(Math.max(range.from, range.to), buffer.text);
  const nextText =
    buffer.text.slice(START, from) + text + buffer.text.slice(to);
  return { selection: collapsed(from + text.length), text: nextText };
}

/**
 * Insert `text` at the cursor, replacing the selection if there is one.
 *
 * @param buffer - Buffer to change
 * @param text - Text to insert
 * @returns The new buffer, or the same buffer for an empty insert without selection
 */
function insertText(buffer: TextBuffer, text: string): TextBuffer {
  if (text === "" && isCollapsed(buffer)) {
    return buffer;
  }
  return replaceRange(
    buffer,
    { from: selectionStart(buffer), to: selectionEnd(buffer) },
    text
  );
}

/**
 * Backspace: delete the selection, or the character before the cursor.
 *
 * @param buffer - Buffer to change
 * @returns The new buffer, or the same buffer at the start of the text
 */
function deleteBackward(buffer: TextBuffer): TextBuffer {
  if (!isCollapsed(buffer)) {
    return insertText(buffer, "");
  }
  const { head } = buffer.selection;
  if (head === START) {
    return buffer;
  }
  return replaceRange(buffer, { from: head - ONE, to: head }, "");
}

/**
 * Delete: delete the selection, or the character after the cursor.
 *
 * @param buffer - Buffer to change
 * @returns The new buffer, or the same buffer at the end of the text
 */
function deleteForward(buffer: TextBuffer): TextBuffer {
  if (!isCollapsed(buffer)) {
    return insertText(buffer, "");
  }
  const { head } = buffer.selection;
  if (head === buffer.text.length) {
    return buffer;
  }
  return replaceRange(buffer, { from: head, to: head + ONE }, "");
}

export {
  createTextBuffer,
  deleteBackward,
  deleteForward,
  insertText,
  isCollapsed,
  moveCursor,
  replaceRange,
  select,
  selectionEnd,
  selectionStart,
};
export type { Range, Selection, TextBuffer };
