/**
 * The input stack: a regex-masked input jumps the cursor to the end and
 * mangles pastes; the minuta field keeps the cursor and reads the paste,
 * and every layer's state is shown live.
 */
import {
  clampDay,
  dateMask,
  dateOrder,
  deriveFormat,
  parseSegments,
  rotateSegment,
  segmentAtPosition,
  toDate,
  typeDate,
  withSegments,
} from "datefield";
import { createInputState, isComplete } from "input-state";
import { dayLabel, demoRoots, part } from "./dom";
import type { DateFormat } from "datefield";
import type { InputState } from "input-state";
import { attachInput } from "input-dom";
import { parseDate } from "fechita";

const LOCALE = "de-CH";
const DIGITS = 8;
const DAY_END = 2;
const MONTH_END = 4;
const FIRST = 0;
const UP = 1;
const DOWN = -1;

// The usual mask: keep the digits, put the dots back, set the value
function naiveMask(value: string): string {
  const digits = value.replaceAll(/\D/gu, "").slice(FIRST, DIGITS);
  return [
    digits.slice(FIRST, DAY_END),
    digits.slice(DAY_END, MONTH_END),
    digits.slice(MONTH_END),
  ]
    .filter((piece) => piece !== "")
    .join(".");
}

function pastedDate(
  format: Readonly<DateFormat>,
  text: string
): Date | undefined {
  const result = parseDate(text, { locale: LOCALE, order: dateOrder(format) });
  if (result.valid) {
    return result.date;
  }
  return undefined;
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

function dateText(format: Readonly<DateFormat>, state: InputState): string {
  const date = toDate(parseSegments(format, state.buffer.text));
  if (date === undefined) {
    return "undefined — not complete yet";
  }
  return dayLabel(date);
}

function showLayers(
  root: HTMLElement,
  format: Readonly<DateFormat>,
  state: InputState
): void {
  const { anchor, head } = state.buffer.selection;
  part(root, "buffer", HTMLElement).textContent =
    `text "${state.buffer.text}", selection ${String(anchor)}–${String(head)}`;
  part(root, "state", HTMLElement).textContent =
    `mode "${state.mode}", complete: ${String(isComplete(state))}`;
  part(root, "segments", HTMLElement).textContent = parseSegments(
    format,
    state.buffer.text
  )
    .filter((segment) => segment.type !== "literal")
    .map((segment) => `${segment.type} "${segment.value}"`)
    .join(" · ");
  part(root, "date", HTMLElement).textContent = dateText(format, state);
}

function mountField(root: HTMLElement): void {
  const format = deriveFormat(LOCALE);
  const controller = attachInput(
    part(root, "field", HTMLInputElement),
    createInputState({ mask: dateMask(format) }),
    {
      insert: (state, text) =>
        typeDate(format, state, text, {
          parse: (pasted) => pastedDate(format, pasted),
        }),
      normalize: (state) =>
        withSegments(
          state,
          clampDay(
            parseSegments(format, state.buffer.text),
            state.buffer.selection.head
          )
        ),
      onChange: (state) => {
        showLayers(root, format, state);
      },
      onKeyDown: (event, state) => rotated(format, state, event.key),
    }
  );
  showLayers(root, format, controller.getState());
}

function mountNaive(root: HTMLElement): void {
  const naive = part(root, "naive", HTMLInputElement);
  naive.addEventListener("input", () => {
    naive.value = naiveMask(naive.value);
    part(root, "naive-value", HTMLElement).textContent =
      `"${naive.value}", cursor at ${String(naive.selectionStart)}`;
  });
}

// Paste the same text into both inputs, at their cursors
function paste(root: HTMLElement, text: string): void {
  const naive = part(root, "naive", HTMLInputElement);
  naive.setRangeText(
    text,
    naive.selectionStart ?? FIRST,
    naive.selectionEnd ?? FIRST,
    "end"
  );
  naive.dispatchEvent(new Event("input"));
  part(root, "field", HTMLInputElement).dispatchEvent(
    new InputEvent("beforeinput", {
      bubbles: true,
      cancelable: true,
      data: text,
      inputType: "insertFromPaste",
    })
  );
}

/**
 * Wire up every input-stack demo on the page.
 */
function mountInputStackDemos(): void {
  for (const root of demoRoots("input-stack")) {
    mountNaive(root);
    mountField(root);
    for (const button of root.querySelectorAll<HTMLButtonElement>(
      "[data-paste]"
    )) {
      button.addEventListener("click", () => {
        paste(root, button.dataset["paste"] ?? "");
      });
    }
  }
}

export { mountInputStackDemos };
