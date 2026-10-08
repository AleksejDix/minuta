import type { CSSProperties, JSX, ReactNode, RefObject } from "react";
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
import { LocaleSelect } from "./LocaleSelect";
import { attachInput } from "input-dom";
import { createInputState } from "input-state";

type DateField = Readonly<{
  format: DateFormat;
  ref: RefObject<HTMLInputElement>;
  setDate: (date: Readonly<Date>) => void;
  state: InputState;
}>;

type SegmentedDateInputProps = Readonly<{
  date?: Readonly<Date> | undefined;
}>;

const LOCALES = ["de-CH", "en-US", "en-GB", "ja-JP", "ko-KR", "fr-FR"];
const DEFAULT_LOCALE = "de-CH";
const UP = 1;
const DOWN = -1;
const JSON_INDENT = 2;

const TITLE = "datefield + input-dom";
const DATE_LABEL = "Date";
const TO_DATE_LABEL = "toDate():";
const INVALID_DATE = "undefined (incomplete or invalid)";

const SECTION_STYLE: CSSProperties = {
  display: "grid",
  gap: "1rem",
  minWidth: "20rem",
};
const TITLE_STYLE: CSSProperties = { margin: 0 };
const LABEL_STYLE: CSSProperties = { display: "grid", gap: "0.25rem" };
const INPUT_STYLE: CSSProperties = {
  fontFamily: "monospace",
  fontSize: "1.5rem",
  padding: "0.5rem",
};
const STATE_STYLE: CSSProperties = { fontSize: "0.75rem", margin: 0 };

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

function renderDate(date: Readonly<Date> | undefined): ReactNode {
  if (date === undefined) {
    return <em>{INVALID_DATE}</em>;
  }
  return date.toDateString();
}

/**
 * React is one consumer of the vanilla stack: input-dom owns the field state,
 * React only mirrors it for rendering. A new locale re-attaches with its mask.
 *
 * @param locale - Locale that decides the date format
 * @param initialDate - Date shown before the user types
 * @returns The format, the input ref, a date setter and the mirrored state
 */
function useDateField(
  locale: string,
  initialDate: Readonly<Date> | undefined
): DateField {
  const ref = useRef<HTMLInputElement>(null);
  const controller = useRef<InputController>();
  const format = useMemo(() => deriveFormat(locale), [locale]);
  const [state, setState] = useState(() =>
    fieldFor(format, initialDate, locale)
  );

  useEffect((): (() => void) | undefined => {
    const element = ref.current;
    if (element === null) {
      return undefined;
    }
    const current = toDate(parseSegments(format, element.value));
    const attached = attachInput(element, fieldFor(format, current, locale), {
      normalize: (next) =>
        withSegments(next, clampDay(parseSegments(format, next.buffer.text))),
      onChange: setState,
      onKeyDown: (event, next) => rotated(format, next, event.key),
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
    if (controller.current !== undefined) {
      controller.current.setState(next);
    }
    setState(next);
  }

  return { format, ref, setDate, state };
}

function SegmentedDateInput({
  date: selected,
}: SegmentedDateInputProps): JSX.Element {
  const [locale, setLocale] = useState(DEFAULT_LOCALE);
  const { format, ref, setDate, state } = useDateField(locale, selected);

  // A date picked outside (the calendar) replaces the field's value
  const [prevSelected, setPrevSelected] = useState(selected);
  if (selected !== prevSelected) {
    setPrevSelected(selected);
    if (selected !== undefined) {
      setDate(selected);
    }
  }

  const date = toDate(parseSegments(format, state.buffer.text));

  return (
    <section style={SECTION_STYLE}>
      <h2 style={TITLE_STYLE}>{TITLE}</h2>
      <LocaleSelect locale={locale} locales={LOCALES} onChange={setLocale} />
      <label style={LABEL_STYLE}>
        {DATE_LABEL}
        <input ref={ref} inputMode="numeric" style={INPUT_STYLE} />
      </label>
      <div>
        <strong>{TO_DATE_LABEL}</strong> {renderDate(date)}
      </div>
      <pre style={STATE_STYLE}>{JSON.stringify(state, null, JSON_INDENT)}</pre>
    </section>
  );
}

export { SegmentedDateInput };
