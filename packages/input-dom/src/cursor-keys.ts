import type { InputState } from "input-state";
import { setSelection } from "input-state";

const ONE = 1;
const START = 0;

type Move = (head: number, length: number) => number;

const MOVES: ReadonlyMap<string, Move> = new Map<string, Move>([
  ["ArrowLeft", (head) => head - ONE],
  ["ArrowRight", (head) => head + ONE],
  ["End", (_head, length) => length],
  ["Home", () => START],
]);

function hasModifier(event: KeyboardEvent): boolean {
  return event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
}

/**
 * Move the cursor in overwrite mode. The cursor shows as a one-character
 * selection there, which the browser would only collapse on ArrowLeft, so
 * the controller moves it itself.
 *
 * @param state - The current state
 * @param event - The key pressed
 * @returns The moved state, or undefined to leave the key to the browser
 */
function moveCursor(
  state: InputState,
  event: KeyboardEvent
): InputState | undefined {
  const move = MOVES.get(event.key);
  if (move === undefined || state.mode !== "overwrite" || hasModifier(event)) {
    return undefined;
  }
  const { length } = state.buffer.text;
  const target = move(state.buffer.selection.head, length);
  return setSelection(state, Math.min(Math.max(target, START), length));
}

export { moveCursor };
