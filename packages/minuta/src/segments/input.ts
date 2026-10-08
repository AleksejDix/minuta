import type { Segment, SegmentType } from "./types";
import { nextSegment } from "./navigate";

const EDITABLE_TYPES: Set<SegmentType> = new Set([
  "day",
  "month",
  "year",
  "hour",
  "minute",
  "second",
]);

/**
 * Result of typing a character into a segment.
 */
export type InputResult = {
  segments: Segment[];
  /** The new active segment index (advances after segment is full) */
  activeIndex: number;
};

/**
 * Handle a digit being typed into the active segment.
 *
 * Digits fill left-to-right within the segment. When the segment
 * is full, the active index advances to the next editable segment.
 *
 * Non-digit characters are ignored.
 *
 * @example
 * // Typing "3" into an empty day segment "DD"
 * inputDigit(segments, 0, "3")
 * // segment value becomes "3_", cursor stays
 *
 * // Typing "1" to complete "31"
 * inputDigit(segments, 0, "1")
 * // segment value becomes "31", cursor advances to month
 */
export function inputDigit(
  segments: Segment[],
  activeIndex: number,
  char: string
): InputResult {
  if (!/^\d$/.test(char)) {
    return { segments, activeIndex };
  }

  const seg = segments[activeIndex];
  if (!seg || !EDITABLE_TYPES.has(seg.type)) {
    return { segments, activeIndex };
  }

  // Strip placeholder underscores and append the new digit
  const clean = seg.value.replace(/_/g, "");
  const maxLen = seg.end - seg.start;
  const newValue = (clean + char).slice(-maxLen);
  const padded = newValue.padStart(maxLen, "_");

  const updated = segments.map((s, i) =>
    i === activeIndex ? { ...s, value: padded } : s
  );

  // Advance to next segment if this one is now full
  const isFull = !padded.includes("_");
  const newIndex = isFull ? nextSegment(segments, activeIndex) : activeIndex;

  return { segments: updated, activeIndex: newIndex };
}

/**
 * Clear the active segment, resetting it to underscores.
 */
export function clearSegment(
  segments: Segment[],
  activeIndex: number
): Segment[] {
  const seg = segments[activeIndex];
  if (!seg || !EDITABLE_TYPES.has(seg.type)) return segments;

  const maxLen = seg.end - seg.start;
  return segments.map((s, i) =>
    i === activeIndex ? { ...s, value: "_".repeat(maxLen) } : s
  );
}
