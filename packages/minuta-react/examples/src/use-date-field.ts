import {
  clampDay,
  dateMask,
  deriveFormat,
  fromDate,
  parseSegments,
  rotateSegment,
  segmentAtPosition,
  segmentsToString,
  toDate,
  withSegments,
} from "datefield";
import { useEffect, useMemo, useRef, useState } from "react";
import type { DateFormat } from "datefield";
import type { InputController } from "input-dom";
import type { InputState } from "input-state";
import type { RefObject } from "react";
import { attachInput } from "input-dom";
import { createInputState } from "input-state";

type DateField = Readonly<{
  date: Readonly<Date> | undefined;
  inputRef: RefObject<HTMLInputElement>;
  setDate: (date: Readonly<Date>) => void;
  state: InputState;
}>;

const UP = 1;
const DOWN = -1;

function fieldFor(
  format: Readonly<DateFormat>,
  date: Readonly<Date> | undefined,
  locale: string
): InputState {
  const mask = dateMask(format);
  if (date === undefined) {
    return createInputState({ mask });
  }
  return createInputState({
    mask,
    value: segmentsToString(fromDate(date, format, locale)),
  });
}

function rotationDirection(key: string): typeof UP | typeof DOWN {
  if (key === "ArrowUp") {
    return UP;
  }
  return DOWN;
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
  return withSegments(
    state,
    rotateSegment(segments, index, rotationDirection(key))
  );
}

/**
 * Attach input-dom with the date rules: day clamping after every change and
 * segment rotation on the arrow keys.
 *
 * @param element - The input to control
 * @param field - Date format, initial state and change callback
 * @returns The input-dom controller
 */
function attachField(
  element: HTMLInputElement,
  field: Readonly<{
    format: Readonly<DateFormat>;
    initial: InputState;
    onChange: (next: InputState) => void;
  }>
): InputController {
  const { format, initial, onChange } = field;
  return attachInput(element, initial, {
    normalize: (next) =>
      withSegments(next, clampDay(parseSegments(format, next.buffer.text))),
    onChange,
    onKeyDown: (event, next) => rotated(format, next, event.key),
  });
}

/**
 * React is one consumer of the vanilla stack: input-dom owns the field state,
 * React only mirrors it for rendering. A new locale re-attaches with its mask;
 * `lastDate` keeps the current date across that instead of re-parsing text.
 *
 * @param locale - Locale that decides the date format
 * @param initialDate - Date shown before the user types
 * @returns The date, the input ref, a date setter and the mirrored state
 */
function useDateField(
  locale: string,
  initialDate: Readonly<Date> | undefined
): DateField {
  const inputRef = useRef<HTMLInputElement>(null);
  const controller = useRef<InputController>();
  const lastDate = useRef<Readonly<Date> | undefined>(initialDate);
  const format = useMemo(() => deriveFormat(locale), [locale]);
  const [state, setState] = useState(() =>
    fieldFor(format, initialDate, locale)
  );

  useEffect((): (() => void) | undefined => {
    const element = inputRef.current;
    if (element === null) {
      return undefined;
    }
    const attached = attachField(element, {
      format,
      initial: fieldFor(format, lastDate.current, locale),
      onChange: (next) => {
        lastDate.current = toDate(parseSegments(format, next.buffer.text));
        setState(next);
      },
    });
    controller.current = attached;
    setState(attached.getState());
    return () => {
      attached.destroy();
    };
  }, [format, locale]);

  /**
   * Replace the field's value, in input-dom and in the mirrored state.
   *
   * @param date - The new date
   */
  function setDate(date: Readonly<Date>): void {
    const next = fieldFor(format, date, locale);
    lastDate.current = date;
    if (controller.current !== undefined) {
      controller.current.setState(next);
    }
    setState(next);
  }

  const date = toDate(parseSegments(format, state.buffer.text));
  return { date, inputRef, setDate, state };
}

export { useDateField };
