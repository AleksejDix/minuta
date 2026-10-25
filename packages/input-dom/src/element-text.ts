// Text that reached the element without a beforeinput

import { createInputState, paste } from "@aleksejdix/input-state";
import type { InputState } from "@aleksejdix/input-state";
import { shownText } from "./shown-text";

type Insert = (state: InputState, text: string) => InputState;

type TextOptions = Readonly<{
  digits?: readonly string[] | undefined;
  insert?: Insert | undefined;
}>;

/** What the listener needs from an attached input. */
type TextSession = Readonly<{
  commit: (event: Event, next: InputState | undefined) => void;
  current: () => InputState;
  options: TextOptions;
}>;

/**
 * The state for text that reached the element without a `beforeinput`
 * (autofill, WebDriver, `fireEvent`), or undefined when it is the text
 * already shown. The text goes through `insert` into an empty state with the
 * same mask and mode, so the mask normalizes it.
 *
 * @param element - The input
 * @param state - The current state
 * @param options - How text is inserted and which digits are shown
 * @returns The state for the element's text, or undefined
 */
function stateFromElement(
  element: HTMLInputElement,
  state: InputState,
  options: TextOptions
): InputState | undefined {
  if (element.value === shownText(state.buffer.text, options.digits)) {
    return undefined;
  }
  const empty = createInputState({ mask: state.mask, mode: state.mode });
  return (options.insert ?? paste)(empty, element.value);
}

/**
 * Read the element's text on `input` and `change`, and on `blur` as a safety
 * net. A handled `beforeinput` is cancelled, so these only change the state
 * when the text changed without one.
 *
 * @param element - The input
 * @param session - How the attached input applies an edit
 * @param signal - Stops listening when aborted
 */
function listenForText(
  element: HTMLInputElement,
  session: TextSession,
  signal: AbortSignal
): void {
  for (const type of ["input", "change", "blur"]) {
    element.addEventListener(
      type,
      (event) => {
        session.commit(
          event,
          stateFromElement(element, session.current(), session.options)
        );
      },
      { signal }
    );
  }
}

export { listenForText };
