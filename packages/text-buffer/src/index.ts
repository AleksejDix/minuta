/**
 * Immutable text plus selection with pure editing operations (text-buffer).
 *
 * Layer 1 of the input stack: no input modes, no masks, no DOM.
 */
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
} from "./text-buffer";
export type { Range, Selection, TextBuffer } from "./text-buffer";
