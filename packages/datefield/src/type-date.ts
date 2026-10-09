/**
 * Typing into a date field the way people type dates: digits fill slots,
 * and a separator finishes a half-typed segment, so "1.3.2026" becomes
 * 01.03.2026 instead of 13.20.26.
 */

import type { DateFormat, Segment } from "./types";
import { setSelection, slotChar, typeChar } from "input-state";
import type { InputState } from "input-state";
import { fromDate } from "./convert";
import { fullYear } from "./year";
import { nextSegment } from "./navigate";
import { parseSegments } from "./parse";
import { withSegments } from "./field";

const ZERO_PAD = "0";
const START = 0;
const ONE_CHAR = 1;
const TWO_DIGITS = 2;
const DIGITS = /^\d+$/u;
// Separators people type between date parts: punctuation, spaces, symbols
const SEPARATOR = /^[\p{P}\p{S}\p{Zs}]$/u;

const DATE_PARTS: ReadonlySet<string> = new Set([
  "day",
  "hour",
  "minute",
  "month",
  "second",
  "year",
]);

/**
 * The segment value for the digits typed so far: zero-padded, and a
 * two-digit year typed into a longer year segment read as a full year.
 *
 * @param seg - The segment being finished
 * @param typed - The digits before the cursor
 * @returns The value filling the whole segment
 */
function finishedValue(seg: Segment, typed: string): string {
  const width = seg.end - seg.start;
  if (seg.type === "year" && typed.length <= TWO_DIGITS) {
    return String(fullYear(Number(typed), TWO_DIGITS)).padStart(
      width,
      ZERO_PAD
    );
  }
  return typed.padStart(width, ZERO_PAD);
}

function finishedSegments(
  segments: readonly Segment[],
  index: number,
  value: string
): Segment[] {
  return segments.map((seg, position) => {
    if (position !== index) {
      return seg;
    }
    return { end: seg.end, start: seg.start, type: seg.type, value };
  });
}

function finishedAt(
  segments: readonly Segment[],
  cursor: number
): Readonly<{ index: number; seg: Segment; typed: string }> | undefined {
  const index = segments.findIndex(
    (seg) => DATE_PARTS.has(seg.type) && cursor > seg.start && cursor < seg.end
  );
  const seg = segments[index];
  if (seg === undefined) {
    return undefined;
  }
  const typed = seg.value.slice(START, cursor - seg.start);
  if (!DIGITS.test(typed)) {
    return undefined;
  }
  return { index, seg, typed };
}

/**
 * Finish the segment the cursor is inside: pad what was typed and move to
 * the next segment. A separator at a segment's start does nothing, so
 * typing "31.03.2026" after the automatic jump does not skip a part. Call it
 * on blur to finish the last segment ("1" → "01").
 *
 * @param format - The field's format
 * @param state - The field
 * @returns The field with the segment finished
 */
function finishSegment(
  format: Readonly<DateFormat>,
  state: InputState
): InputState {
  const segments = parseSegments(format, state.buffer.text);
  const found = finishedAt(segments, state.buffer.selection.head);
  if (found === undefined) {
    return state;
  }
  const { index, seg, typed } = found;
  const finished = withSegments(
    state,
    finishedSegments(segments, index, finishedValue(seg, typed))
  );
  const next = segments[nextSegment(segments, index)] ?? seg;
  return setSelection(finished, Math.max(next.start, seg.end));
}

// Digits fill slots, separators finish the segment, anything else is ignored
function typedChars(
  format: Readonly<DateFormat>,
  state: InputState,
  text: string
): InputState {
  let next = state;
  for (const char of text) {
    if (slotChar("digit", char) !== undefined) {
      next = typeChar(next, char);
    } else if (SEPARATOR.test(char)) {
      next = finishSegment(format, next);
    }
  }
  return next;
}

/**
 * Options of `typeDate`.
 */
type TypeOptions = Readonly<{
  /**
   * Reads a pasted date in any form, e.g. fechita's `parseDate` with the
   * field's order. Without it a paste is typed like keystrokes.
   */
  parse?: ((text: string) => Readonly<Date> | undefined) | undefined;
}>;

/**
 * The field holding the date `parse` finds in pasted text, written in the
 * field's format with the cursor at the end.
 *
 * @param format - The field's format
 * @param state - The field
 * @param paste - The pasted text and the parser
 * @returns The filled field, or undefined for typed or unrecognised text
 */
function pastedDate(
  format: Readonly<DateFormat>,
  state: InputState,
  paste: Readonly<{ parse: TypeOptions["parse"]; text: string }>
): InputState | undefined {
  if (paste.parse === undefined || paste.text.length <= ONE_CHAR) {
    return undefined;
  }
  const date = paste.parse(paste.text);
  if (date === undefined) {
    return undefined;
  }
  const filled = withSegments(state, fromDate(date, format));
  return setSelection(filled, filled.buffer.text.length);
}

/**
 * Type text into a date field: digits (of any script) fill the slots,
 * separators finish the segment being typed, other characters are ignored.
 * Text longer than one character is a paste: with `parse`, a date it reads
 * replaces the whole field in its format; anything else is typed and its
 * last segment finished.
 *
 * @example
 * import { parseDate } from "fechita";
 *
 * const format = deriveFormat("de-CH");
 * const field = createInputState({ mask: dateMask(format) });
 * typeDate(format, field, "1.3.2026").buffer.text; // "01.03.2026"
 *
 * const parse = (text: string) => {
 *   const result = parseDate(text, { order: dateOrder(format) });
 *   return result.valid ? result.date : undefined;
 * };
 * typeDate(format, field, "2026-03-31", { parse }).buffer.text; // "31.03.2026"
 *
 * @param format - The field's format
 * @param state - The field
 * @param text - Typed or pasted text
 * @param options - `parse` to read pasted dates in any form
 * @returns The field after typing
 */
// oxlint-disable-next-line eslint/max-params -- (format, state, text) plus the options
function typeDate(
  format: Readonly<DateFormat>,
  state: InputState,
  text: string,
  options: TypeOptions = {}
): InputState {
  const pasted = pastedDate(format, state, { parse: options.parse, text });
  if (pasted !== undefined) {
    return pasted;
  }
  const next = typedChars(format, state, text);
  // Pasted or dropped text is a whole value: finish its last part too
  if (text.length > ONE_CHAR) {
    return finishSegment(format, next);
  }
  return next;
}

export { finishSegment, typeDate };
export type { TypeOptions };
