import { useEffect, useRef, useState } from "react";
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
  type DateFormat,
} from "datefield";
import { createInputState, type InputState } from "input-state";
import { attachInput, type InputController } from "input-dom";

const LOCALES = ["de-CH", "en-US", "en-GB", "ja-JP", "ko-KR", "fr-FR"];
const UP = 1;
const DOWN = -1;

function fieldFor(format: DateFormat, date: Date | undefined, locale: string) {
  const mask = dateMask(format);
  if (date === undefined) {
    return createInputState({ mask });
  }
  return createInputState({
    mask,
    value: segmentsToString(fromDate(date, format, locale)),
  });
}

function rotated(format: DateFormat, state: InputState, key: string) {
  if (key !== "ArrowUp" && key !== "ArrowDown") {
    return undefined;
  }
  const segments = parseSegments(format, state.buffer.text);
  const index = segmentAtPosition(segments, state.buffer.selection.head);
  return withSegments(
    state,
    rotateSegment(segments, index, key === "ArrowUp" ? UP : DOWN)
  );
}

/**
 * React is one consumer of the vanilla stack: input-dom owns the field state,
 * React only mirrors it for rendering. A new locale re-attaches with its mask.
 */
function useDateField(locale: string, initialDate: Date | undefined) {
  const ref = useRef<HTMLInputElement>(null);
  const controller = useRef<InputController>(undefined);
  const format = deriveFormat(locale);
  const [state, setState] = useState(() =>
    fieldFor(format, initialDate, locale)
  );

  useEffect(() => {
    const element = ref.current;
    if (element === null) return;
    const current = toDate(parseSegments(format, element.value));
    const attached = attachInput(element, fieldFor(format, current, locale), {
      normalize: (next) =>
        withSegments(next, clampDay(parseSegments(format, next.buffer.text))),
      onChange: setState,
      onKeyDown: (event, next) => rotated(format, next, event.key),
    });
    controller.current = attached;
    setState(attached.getState());
    return () => attached.destroy();
  }, [locale]);

  function setDate(date: Date) {
    const next = fieldFor(format, date, locale);
    controller.current?.setState(next);
    setState(next);
  }

  return { format, ref, setDate, state };
}

export function SegmentedDateInput({
  date: selected,
}: {
  date?: Date | undefined;
}) {
  const [locale, setLocale] = useState(LOCALES[0] ?? "de-CH");
  const field = useDateField(locale, selected);

  // A date picked outside (the calendar) replaces the field's value
  const [prevSelected, setPrevSelected] = useState(selected);
  if (selected !== prevSelected) {
    setPrevSelected(selected);
    if (selected !== undefined) field.setDate(selected);
  }

  const date = toDate(parseSegments(field.format, field.state.buffer.text));

  return (
    <section style={{ display: "grid", gap: "1rem", minWidth: "20rem" }}>
      <h2 style={{ margin: 0 }}>datefield + input-dom</h2>

      <label style={{ display: "grid", gap: "0.25rem" }}>
        Locale
        <select value={locale} onChange={(e) => setLocale(e.target.value)}>
          {LOCALES.map((l) => (
            <option key={l}>{l}</option>
          ))}
        </select>
      </label>

      <label style={{ display: "grid", gap: "0.25rem" }}>
        Date
        <input
          ref={field.ref}
          inputMode="numeric"
          style={{
            fontFamily: "monospace",
            fontSize: "1.5rem",
            padding: "0.5rem",
          }}
        />
      </label>

      <div>
        <strong>toDate():</strong>{" "}
        {date ? (
          date.toDateString()
        ) : (
          <em>undefined (incomplete or invalid)</em>
        )}
      </div>

      <pre style={{ fontSize: "0.75rem", margin: 0 }}>
        {JSON.stringify(field.state, null, 2)}
      </pre>
    </section>
  );
}
