/**
 * Input field state: text buffer + mask + insert/overwrite mode (input-state).
 *
 * Layer 2 of the input stack: pure keyboard operations, no DOM.
 */
export {
  backspace,
  createInputState,
  deleteForward,
  isComplete,
  paste,
  setSelection,
  toggleMode,
  typeChar,
} from "./input-state";
export { accepts, emptyText, parseMask, slotChar, slotPositions } from "./mask";
export type { InputOptions, InputState, Mode } from "./input-state";
export type { CharClass, Mask, MaskToken } from "./mask";
