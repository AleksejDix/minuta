import type { DateFormat, FieldValue } from "@aleksejdix/datefield";
import {
  clampDay,
  dateMask,
  dateOrder,
  deriveFormat,
  fromTemporal,
  parseSegments,
  rotateSegment,
  segmentAtPosition,
  segmentsToString,
  toPlainDate,
  typeDate,
  withSegments,
} from "@aleksejdix/datefield";
import { useEffect, useMemo, useRef, useState } from "react";
import type { InputController } from "@aleksejdix/input-dom";
import type { InputState } from "@aleksejdix/input-state";
import type { Ref } from "react";
import type { Temporal } from "temporal-polyfill";
import { attachInput } from "@aleksejdix/input-dom";
import { createInputState } from "@aleksejdix/input-state";
import { parseDate } from "@aleksejdix/fechita";

/** The field's value: a calendar date. */
type Day = Readonly<Temporal.PlainDate>;

type DateField = Readonly<{
  date: Day | undefined;
  inputRef: Ref<HTMLInputElement>;
  setDate: (date: Day) => void;
  state: InputState;
}>;

const UP = 1;
const DOWN = -1;

function fieldFor(
  format: Readonly<DateFormat>,
  date: Day | undefined,
  locale: string
): InputState {
  const mask = dateMask(format);
  if (date === undefined) {
    return createInputState({ mask });
  }
  return createInputState({
    mask,
    value: segmentsToString(fromTemporal(date, format, locale)),
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

const USER_ZONE = new Intl.DateTimeFormat().resolvedOptions().timeZone;

// The demo reads pastes in every locale; an app loads only the ones it needs
function pastedDate(
  text: string,
  locale: string,
  format: Readonly<DateFormat>
): FieldValue | undefined {
  const result = parseDate(text, { locale, order: dateOrder(format) });
  if (!result.valid) {
    return undefined;
  }
  if (result.kind === "instant") {
    // The field shows a wall clock: the instant's in the user's zone
    return result.value.toZonedDateTimeISO(USER_ZONE).toPlainDateTime();
  }
  return result.value;
}

/**
 * Attach input-dom with the date rules: typing and pasting the way people
 * write dates, day clamping after every change and segment rotation on the
 * arrow keys.
 *
 * @param element - The input to control
 * @param field - Date format, locale, initial state and change callback
 * @returns The input-dom controller
 */
function attachField(
  element: HTMLInputElement,
  field: Readonly<{
    format: Readonly<DateFormat>;
    initial: InputState;
    locale: string;
    onChange: (next: InputState) => void;
  }>
): InputController {
  const { format, initial, locale, onChange } = field;
  return attachInput(element, initial, {
    insert: (state, text) =>
      typeDate(format, state, text, {
        parse: (pasted) => pastedDate(pasted, locale, format),
      }),
    // With the cursor: no clamping while a date part is still being typed
    normalize: (next) =>
      withSegments(
        next,
        clampDay(
          parseSegments(format, next.buffer.text),
          next.buffer.selection.head
        )
      ),
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
function useDateField(locale: string, initialDate: Day | undefined): DateField {
  const inputRef = useRef<HTMLInputElement>(null);
  const controller = useRef<InputController | null>(null);
  const lastDate = useRef<Day | undefined>(initialDate);
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
      locale,
      onChange: (next) => {
        lastDate.current = toPlainDate(parseSegments(format, next.buffer.text));
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
  function setDate(date: Day): void {
    const next = fieldFor(format, date, locale);
    lastDate.current = date;
    if (controller.current !== null) {
      controller.current.setState(next);
    }
    setState(next);
  }

  const date = toPlainDate(parseSegments(format, state.buffer.text));
  return { date, inputRef, setDate, state };
}

export { useDateField };
