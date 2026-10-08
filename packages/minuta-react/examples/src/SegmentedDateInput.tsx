import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { createNativeAdapter } from "minuta/native";
import {
  GapBuffer,
  REGEXP_ONLY_DIGITS,
  clampDay,
  deriveFormat,
  fromDate,
  fromSlots,
  rotateSegment,
  segmentAtPosition,
  segmentsToString,
  toDate,
  toSlots,
  type DateFormat,
  type Segment,
} from "minuta/segments";

const adapter = createNativeAdapter();

const LOCALES = ["de-CH", "en-US", "en-GB", "ja-JP", "ko-KR", "fr-FR"];

function editable(segments: Segment[]) {
  return segments.filter((s) => s.type !== "literal");
}

/** Character position in the display string of a GapBuffer slot. */
function slotToPos(segments: Segment[], slot: number): number {
  let remaining = slot;
  for (const s of editable(segments)) {
    const len = s.end - s.start;
    if (remaining < len) return s.start + remaining;
    remaining -= len;
  }
  return segments[segments.length - 1]?.end ?? 0;
}

/** GapBuffer slot of a character position (separators snap forward). */
function posToSlot(segments: Segment[], pos: number): number {
  let slot = 0;
  for (const s of editable(segments)) {
    if (pos < s.end) return slot + Math.max(0, pos - s.start);
    slot += s.end - s.start;
  }
  return slot - 1;
}

function emptyBuffer(format: DateFormat) {
  const maxLength = editable(fromSlots(format, "")).reduce(
    (sum, s) => sum + s.end - s.start,
    0
  );
  return new GapBuffer({ maxLength, pattern: REGEXP_ONLY_DIGITS });
}

function bufferFromDate(format: DateFormat, date: Date, locale: string) {
  return emptyBuffer(format).setValue(
    toSlots(fromDate(adapter, date, format, locale))
  );
}

export function SegmentedDateInput({ date: selected }: { date?: Date }) {
  const [locale, setLocale] = useState(LOCALES[0]);
  const format = useMemo(() => deriveFormat(locale), [locale]);
  const [buffer, setBuffer] = useState(() =>
    selected ? bufferFromDate(format, selected, locale) : emptyBuffer(format)
  );
  const inputRef = useRef<HTMLInputElement>(null);

  // A date picked outside (the calendar) replaces the input's value
  const [prevSelected, setPrevSelected] = useState(selected);
  if (selected !== prevSelected) {
    setPrevSelected(selected);
    if (selected) setBuffer(bufferFromDate(format, selected, locale));
  }

  const segments = fromSlots(format, buffer.toString());
  const caretPos = slotToPos(segments, buffer.cursor);

  // Select the single char under the cursor, so it reads as overwrite mode
  useLayoutEffect(() => {
    const input = inputRef.current;
    if (input && document.activeElement === input) {
      input.setSelectionRange(caretPos, caretPos + 1);
    }
  }, [buffer, caretPos]);

  function changeLocale(next: string) {
    const nextFormat = deriveFormat(next);
    const current = toDate(adapter, segments);
    setLocale(next);
    setBuffer(
      current
        ? bufferFromDate(nextFormat, current, next)
        : emptyBuffer(nextFormat)
    );
  }

  /** Commit a buffer, clamping the day so the date always stays accurate. */
  function commit(
    next: GapBuffer,
    nextSegments = fromSlots(format, next.toString())
  ) {
    const value = toSlots(clampDay(nextSegments));
    setBuffer(
      value === next.toString()
        ? next
        : new GapBuffer({
            maxLength: next.maxLength,
            value,
            cursor: next.cursor,
            pattern: REGEXP_ONLY_DIGITS,
          })
    );
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    switch (e.key) {
      case "ArrowUp":
      case "ArrowDown": {
        e.preventDefault();
        const index = segmentAtPosition(segments, caretPos);
        const rotated = rotateSegment(
          segments,
          index,
          e.key === "ArrowUp" ? 1 : -1
        );
        commit(buffer.setValue(toSlots(rotated)).focus(buffer.cursor), rotated);
        return;
      }
      case "ArrowRight":
        e.preventDefault();
        setBuffer(buffer.focus(buffer.cursor + 1));
        return;
      case "ArrowLeft":
        e.preventDefault();
        setBuffer(buffer.focus(buffer.cursor - 1));
        return;
      case "Backspace":
        e.preventDefault();
        commit(buffer.backspaceAt(buffer.cursor));
        return;
      case "Tab":
        return; // let focus leave the field
    }
    if (e.key.length === 1) {
      e.preventDefault();
      commit(buffer.insertAt(buffer.cursor, e.key));
    }
  }

  function handleClick() {
    const pos = inputRef.current?.selectionStart ?? 0;
    setBuffer(buffer.focus(posToSlot(segments, pos)));
  }

  const date = toDate(adapter, segments);

  return (
    <section style={{ display: "grid", gap: "1rem", minWidth: "20rem" }}>
      <h2 style={{ margin: 0 }}>minuta/segments</h2>

      <label style={{ display: "grid", gap: "0.25rem" }}>
        Locale
        <select value={locale} onChange={(e) => changeLocale(e.target.value)}>
          {LOCALES.map((l) => (
            <option key={l}>{l}</option>
          ))}
        </select>
      </label>

      <label style={{ display: "grid", gap: "0.25rem" }}>
        Date
        <input
          ref={inputRef}
          value={segmentsToString(segments)}
          onChange={() => {}}
          onKeyDown={handleKeyDown}
          onClick={handleClick}
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
        GapBuffer: "{buffer.toString()}" cursor: {buffer.cursor}
        {"\n"}
        {JSON.stringify(segments, null, 2)}
      </pre>
    </section>
  );
}
