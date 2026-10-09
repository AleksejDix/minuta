/**
 * Vanilla DOM binding for input-state.
 *
 * `attachInput` wires an `<input>` to an InputState: `beforeinput` events
 * (typing, paste, drop, delete — including mobile keyboards) become pure
 * input-state operations, the browser default is prevented, and the new state
 * is rendered back. The controller owns the current state; frameworks wrap it.
 *
 * In overwrite mode a collapsed cursor is shown as a block (one selected
 * character); the binding ignores the echo of that selection.
 */

import {
  backspace,
  deleteForward,
  paste,
  setSelection,
  toggleMode,
} from "input-state";
import type { InputState } from "input-state";
import { moveCursor } from "./cursor-keys";
import { shownText } from "./shown-text";

const ONE = 1;

type AttachOptions = Readonly<{
  /** Digits to show for 0–9, e.g. `localeDigits("ar-EG")`; the state keeps ASCII */
  digits?: readonly string[] | undefined;
  /** Applies typed, pasted and dropped text, default `paste`; e.g. `typeDate` */
  insert?: Insert | undefined;
  normalize?: ((state: InputState) => InputState) | undefined;
  onChange?: ((state: InputState) => void) | undefined;
  onKeyDown?:
    | ((event: KeyboardEvent, state: InputState) => InputState | undefined)
    | undefined;
}>;

type InputController = Readonly<{
  destroy: () => void;
  getState: () => InputState;
  setState: (state: InputState) => void;
}>;

type VisibleRange = Readonly<{
  direction: "backward" | "forward";
  end: number;
  start: number;
}>;

/**
 * The range the element shows for a state: the selection, or a one-character
 * block for a collapsed cursor in overwrite mode.
 *
 * @param state - State to show
 * @returns Start, end and direction for `setSelectionRange`
 */
function visibleRange(state: InputState): VisibleRange {
  const { anchor, head } = state.buffer.selection;
  if (anchor > head) {
    return { direction: "backward", end: anchor, start: head };
  }
  if (anchor < head) {
    return { direction: "forward", end: head, start: anchor };
  }
  if (state.mode === "overwrite" && head < state.buffer.text.length) {
    return { direction: "forward", end: head + ONE, start: head };
  }
  return { direction: "forward", end: head, start: head };
}

function eventText(event: InputEvent): string {
  if (typeof event.data === "string") {
    return event.data;
  }
  if (event.dataTransfer === null) {
    return "";
  }
  return event.dataTransfer.getData("text/plain");
}

/**
 * Map a `beforeinput` event to an input-state operation.
 *
 * @param state - Current state
 * @param event - The beforeinput event
 * @param insert - How typed, pasted and dropped text is applied
 * @returns The next state, or undefined for input types that are ignored
 */
type Insert = (state: InputState, text: string) => InputState;

function applyInputEvent(
  state: InputState,
  event: InputEvent,
  insert: Insert = paste
): InputState | undefined {
  switch (event.inputType) {
    case "insertText":
    case "insertReplacementText":
    case "insertFromPaste":
    case "insertFromDrop": {
      return insert(state, eventText(event));
    }
    case "deleteContentBackward":
    case "deleteWordBackward":
    case "deleteByCut": {
      return backspace(state);
    }
    case "deleteContentForward":
    case "deleteWordForward": {
      return deleteForward(state);
    }
    default: {
      return undefined;
    }
  }
}

function applyKey(
  state: InputState,
  event: KeyboardEvent,
  options: AttachOptions
): InputState | undefined {
  if (event.key === "Insert") {
    return toggleMode(state);
  }
  if (options.onKeyDown !== undefined) {
    const handled = options.onKeyDown(event, state);
    if (handled !== undefined) {
      return handled;
    }
  }
  return moveCursor(state, event);
}

function selectionFromElement(
  element: HTMLInputElement,
  state: InputState,
  shown: VisibleRange
): InputState {
  const start = element.selectionStart ?? shown.start;
  const end = element.selectionEnd ?? shown.end;
  if (start === shown.start && end === shown.end) {
    return state;
  }
  if (element.selectionDirection === "backward") {
    return setSelection(state, end, start);
  }
  return setSelection(state, start, end);
}

/**
 * Show the selection of `state`, e.g. redraw the overwrite block where the
 * user put the cursor.
 *
 * @param element - The input
 * @param state - The state to show
 * @returns The range now shown
 */
function showSelection(
  element: HTMLInputElement,
  state: InputState
): VisibleRange {
  const shown = visibleRange(state);
  element.setSelectionRange(shown.start, shown.end, shown.direction);
  return shown;
}

function render(
  element: HTMLInputElement,
  state: InputState,
  digits: readonly string[] | undefined
): VisibleRange {
  const shown = visibleRange(state);
  element.value = shownText(state.buffer.text, digits);
  element.setSelectionRange(shown.start, shown.end, shown.direction);
  return shown;
}

function normalized(options: AttachOptions, next: InputState): InputState {
  if (options.normalize === undefined) {
    return next;
  }
  return options.normalize(next);
}

type Session = Readonly<{
  commit: (event: Event, next: InputState | undefined) => void;
  current: () => InputState;
  options: AttachOptions;
  syncSelection: () => void;
}>;

function listen(
  element: HTMLInputElement,
  session: Session,
  signal: AbortSignal
): void {
  element.addEventListener(
    "beforeinput",
    (event) => {
      event.preventDefault();
      session.commit(
        event,
        applyInputEvent(session.current(), event, session.options.insert)
      );
    },
    { signal }
  );
  element.addEventListener(
    "keydown",
    (event) => {
      session.commit(
        event,
        applyKey(session.current(), event, session.options)
      );
    },
    { signal }
  );
  for (const type of ["select", "selectionchange"]) {
    element.addEventListener(
      type,
      () => {
        session.syncSelection();
      },
      { signal }
    );
  }
}

/**
 * Bind an `<input>` to an input state.
 *
 * @param element - The input element to control
 * @param initial - Initial state, rendered immediately
 * @param options - normalize (runs after every change), onChange, onKeyDown hook
 * @returns A controller to read, replace or detach the state
 */
function attachInput(
  element: HTMLInputElement,
  initial: InputState,
  options: AttachOptions = {}
): InputController {
  let state = initial;
  let shown = render(element, state, options.digits);
  const listening = new AbortController();
  listen(
    element,
    {
      commit: (event, next) => {
        if (next === undefined) {
          return;
        }
        event.preventDefault();
        const result = normalized(options, next);
        if (result === state) {
          return;
        }
        state = result;
        shown = render(element, state, options.digits);
        if (options.onChange !== undefined) {
          options.onChange(state);
        }
      },
      current: () => state,
      options,
      syncSelection: () => {
        const synced = selectionFromElement(element, state, shown);
        if (synced === state) {
          return;
        }
        state = synced;
        shown = showSelection(element, state);
      },
    },
    listening.signal
  );
  return {
    destroy: () => {
      listening.abort();
    },
    getState: () => state,
    setState: (next) => {
      state = next;
      shown = render(element, state, options.digits);
    },
  };
}

export { applyInputEvent, attachInput, visibleRange };
export type { AttachOptions, InputController, VisibleRange };
