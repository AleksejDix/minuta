import type { Segment, SegmentType } from "./types";

const NOT_FOUND = -1;

const EDITABLE_TYPES: ReadonlySet<SegmentType> = new Set<SegmentType>([
  "day",
  "month",
  "year",
  "hour",
  "minute",
  "second",
]);

function isEditable(seg: Segment | undefined): boolean {
  if (seg === undefined) {
    return false;
  }
  return EDITABLE_TYPES.has(seg.type);
}

function isAtSegment(seg: Segment, cursorPos: number): boolean {
  // The end boundary still counts as this segment
  return cursorPos >= seg.start && cursorPos <= seg.end;
}

/**
 * Index of the last editable segment before `limit`.
 *
 * @param segments - Segments to search
 * @param limit - Exclusive upper bound for the index
 * @param fallback - Returned when no editable segment is found
 * @returns The index, or `fallback`
 */
function lastEditableBefore(
  segments: readonly Segment[],
  limit: number,
  fallback: number
): number {
  let found = fallback;
  for (const [idx, seg] of segments.entries()) {
    if (idx < limit && isEditable(seg)) {
      found = idx;
    }
  }
  return found;
}

/**
 * Index of the last editable (non-literal, non-derived) segment.
 *
 * @param segments - Segments to search
 * @returns The index, or -1 if there is no editable segment
 */
function lastEditableIndex(segments: readonly Segment[]): number {
  return lastEditableBefore(segments, segments.length, NOT_FOUND);
}

/**
 * Find the index of the editable segment at a given cursor position.
 * Skips literal and derived segments. Returns -1 if no editable segment found.
 *
 * @param segments - Segments to search
 * @param cursorPos - Cursor position in the full string
 * @returns The index of the segment at the cursor, or the last editable index as fallback
 */
function segmentAtPosition(
  segments: readonly Segment[],
  cursorPos: number
): number {
  const index = segments.findIndex(
    (seg) => isEditable(seg) && isAtSegment(seg, cursorPos)
  );
  if (index !== NOT_FOUND) {
    return index;
  }
  // Fallback: return last editable segment
  return lastEditableIndex(segments);
}

/**
 * Move to the next editable segment.
 * Returns the current index if no next editable segment exists.
 *
 * @param segments - Segments to search
 * @param current - Index of the current segment
 * @returns The index of the next editable segment
 */
function nextSegment(segments: readonly Segment[], current: number): number {
  const index = segments.findIndex(
    (seg, idx) => idx > current && isEditable(seg)
  );
  if (index === NOT_FOUND) {
    return current;
  }
  return index;
}

/**
 * Move to the previous editable segment.
 * Returns the current index if no previous editable segment exists.
 *
 * @param segments - Segments to search
 * @param current - Index of the current segment
 * @returns The index of the previous editable segment
 */
function previousSegment(
  segments: readonly Segment[],
  current: number
): number {
  return lastEditableBefore(segments, current, current);
}

/**
 * Index of the first editable (non-literal, non-derived) segment.
 *
 * @param segments - Segments to search
 * @returns The index, or -1 if there is no editable segment
 */
function firstEditableIndex(segments: readonly Segment[]): number {
  return segments.findIndex((seg) => isEditable(seg));
}

export {
  firstEditableIndex,
  lastEditableIndex,
  nextSegment,
  previousSegment,
  segmentAtPosition,
};
