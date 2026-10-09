import {
  clampDay,
  dateMask,
  deriveFormat,
  parseSegments,
  rotateSegment,
  segmentAtPosition,
  toDate,
  typeDate,
  withSegments,
} from "datefield";
import { createInputState, isComplete, parseMask } from "input-state";
import type { DateFormat } from "datefield";
import type { InputState } from "input-state";
import { attachInput } from "input-dom";

const UP = 1;
const DOWN = -1;
const JSON_INDENT = 2;

function byId<Element extends HTMLElement>(
  id: string,
  type: new () => Element
): Element {
  const element = document.querySelector(`#${id}`);
  if (!(element instanceof type)) {
    throw new TypeError(`#${id} is missing`);
  }
  return element;
}

function describeState(state: InputState): string {
  return JSON.stringify(
    {
      complete: isComplete(state),
      mode: state.mode,
      selection: state.buffer.selection,
      text: state.buffer.text,
    },
    undefined,
    JSON_INDENT
  );
}

function mountMasked(id: string, pattern: string): void {
  const output = byId(`${id}-out`, HTMLOutputElement);
  const initial = createInputState({ mask: parseMask(pattern) });
  output.textContent = describeState(initial);
  attachInput(byId(id, HTMLInputElement), initial, {
    onChange: (state) => {
      output.textContent = describeState(state);
    },
  });
}

function clampedDate(
  format: Readonly<DateFormat>,
  state: InputState
): InputState {
  return withSegments(
    state,
    clampDay(
      parseSegments(format, state.buffer.text),
      state.buffer.selection.head
    )
  );
}

function rotated(
  format: Readonly<DateFormat>,
  state: InputState,
  key: string
): InputState | undefined {
  if (key !== "ArrowUp" && key !== "ArrowDown") {
    return undefined;
  }
  const segments = parseSegments(format, state.buffer.text);
  const index = segmentAtPosition(segments, state.buffer.selection.head);
  if (key === "ArrowUp") {
    return withSegments(state, rotateSegment(segments, index, UP));
  }
  return withSegments(state, rotateSegment(segments, index, DOWN));
}

function describeDate(format: Readonly<DateFormat>, state: InputState): string {
  const date = toDate(parseSegments(format, state.buffer.text));
  if (date === undefined) {
    return `toDate(): — (incomplete or invalid)\n${describeState(state)}`;
  }
  return `toDate(): ${date.toDateString()}\n${describeState(state)}`;
}

function mountDate(): void {
  const input = byId("date", HTMLInputElement);
  const output = byId("date-out", HTMLOutputElement);
  const locale = byId("locale", HTMLSelectElement);
  let format = deriveFormat(locale.value);
  const controller = attachInput(
    input,
    createInputState({ mask: dateMask(format) }),
    {
      insert: (state, text) => typeDate(format, state, text, locale.value),
      normalize: (state) => clampedDate(format, state),
      onChange: (state) => {
        output.textContent = describeDate(format, state);
      },
      onKeyDown: (event, state) => rotated(format, state, event.key),
    }
  );
  output.textContent = describeDate(format, controller.getState());
  locale.addEventListener("change", () => {
    format = deriveFormat(locale.value);
    controller.setState(createInputState({ mask: dateMask(format) }));
    output.textContent = describeDate(format, controller.getState());
  });
}

function mountFreeText(): void {
  const output = byId("text-out", HTMLOutputElement);
  const initial = createInputState({ value: "Hello world" });
  output.textContent = describeState(initial);
  attachInput(byId("text", HTMLInputElement), initial, {
    onChange: (state) => {
      output.textContent = describeState(state);
    },
  });
}

mountDate();
mountMasked("otp", "999999");
mountMasked("phone", "+99 99 999 99 99");
mountMasked("iban", "AA99 9999 9999 9999 9999 9");
mountFreeText();
