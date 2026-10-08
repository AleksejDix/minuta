/**
 * Vanilla DOM binding for input-state (input-dom).
 *
 * Layer 4 of the input stack: wires an `<input>` element to an InputState.
 * Frameworks (React, Vue, …) wrap `attachInput` in a few lines.
 */
export { applyInputEvent, attachInput, visibleRange } from "./input-dom";
export type { AttachOptions, InputController, VisibleRange } from "./input-dom";
