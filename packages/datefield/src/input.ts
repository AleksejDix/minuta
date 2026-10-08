import type { Segment, SegmentType } from "./types";
import { nextSegment } from "./navigate";

const PLACEHOLDER = "_";

const EDITABLE_TYPES: ReadonlySet<SegmentType> = new Set<SegmentType>([
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
type InputResult = {
  segments: Segment[];
  /** The new active segment index (advances after segment is full) */
  activeIndex: number;
};

function editableAt(
  segments: readonly Segment[],
  index: number
): Segment | undefined {
  const seg = segments[index];
  if (seg === undefined || !EDITABLE_TYPES.has(seg.type)) {
    return undefined;
  }
  return seg;
}

function withValueAt(
  segments: readonly Segment[],
  index: number,
  value: string
): Segment[] {
  return segments.map((seg, idx) => {
    if (idx === index) {
      return { end: seg.end, start: seg.start, type: seg.type, value };
    }
    return seg;
  });
}

/**
 * Strip placeholder underscores, append the new digit and re-pad.
 *
 * @param seg - Segment being typed into
 * @param char - Typed digit
 * @returns The new segment value
 */
function appendDigit(seg: Segment, char: string): string {
  const clean = seg.value.replaceAll(PLACEHOLDER, "");
  const maxLen = seg.end - seg.start;
  const newValue = (clean + char).slice(-maxLen);
  return newValue.padStart(maxLen, PLACEHOLDER);
}

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
 * @param segments - Current segments
 * @param activeIndex - Index of the active segment
 * @param char - Typed character
 * @returns The new segments and active index
 */
function inputDigit(
  // oxlint-disable-next-line typescript/prefer-readonly-parameter-types -- Returned by identity when unchanged; readonly would change the public return type
  segments: Segment[],
  activeIndex: number,
  char: string
): InputResult {
  if (!/^\d$/u.test(char)) {
    return { activeIndex, segments };
  }

  const seg = editableAt(segments, activeIndex);
  if (seg === undefined) {
    return { activeIndex, segments };
  }

  const padded = appendDigit(seg, char);
  const updated = withValueAt(segments, activeIndex, padded);

  // Advance to next segment if this one is now full
  if (padded.includes(PLACEHOLDER)) {
    return { activeIndex, segments: updated };
  }
  return {
    activeIndex: nextSegment(segments, activeIndex),
    segments: updated,
  };
}

/**
 * Clear the active segment, resetting it to underscores.
 *
 * @param segments - Current segments
 * @param activeIndex - Index of the segment to clear
 * @returns The new segments, or the same array when the segment is not editable
 */
function clearSegment(
  // oxlint-disable-next-line typescript/prefer-readonly-parameter-types -- Returned by identity when unchanged; readonly would change the public return type
  segments: Segment[],
  activeIndex: number
): Segment[] {
  const seg = editableAt(segments, activeIndex);
  if (seg === undefined) {
    return segments;
  }
  return withValueAt(
    segments,
    activeIndex,
    PLACEHOLDER.repeat(seg.end - seg.start)
  );
}

export { clearSegment, inputDigit };
export type { InputResult };
