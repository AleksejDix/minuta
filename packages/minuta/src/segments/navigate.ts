import type { Segment, SegmentType } from "./types";

const EDITABLE_TYPES: Set<SegmentType> = new Set([
  "day",
  "month",
  "year",
  "hour",
  "minute",
  "second",
]);

function isEditable(seg: Segment): boolean {
  return EDITABLE_TYPES.has(seg.type);
}

/**
 * Find the index of the editable segment at a given cursor position.
 * Skips literal and derived segments. Returns -1 if no editable segment found.
 */
export function segmentAtPosition(
  segments: Segment[],
  cursorPos: number
): number {
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    if (!isEditable(seg)) continue;
    if (cursorPos >= seg.start && cursorPos < seg.end) return i;
    // If cursor is right at the end boundary, still count as this segment
    if (cursorPos === seg.end) return i;
  }
  // Fallback: return last editable segment
  return lastEditableIndex(segments);
}

/**
 * Move to the next editable segment.
 * Returns the current index if no next editable segment exists.
 */
export function nextSegment(segments: Segment[], current: number): number {
  for (let i = current + 1; i < segments.length; i++) {
    if (isEditable(segments[i])) return i;
  }
  return current;
}

/**
 * Move to the previous editable segment.
 * Returns the current index if no previous editable segment exists.
 */
export function previousSegment(segments: Segment[], current: number): number {
  for (let i = current - 1; i >= 0; i--) {
    if (isEditable(segments[i])) return i;
  }
  return current;
}

/**
 * Index of the first editable (non-literal, non-derived) segment.
 */
export function firstEditableIndex(segments: Segment[]): number {
  return segments.findIndex(isEditable);
}

/**
 * Index of the last editable (non-literal, non-derived) segment.
 */
export function lastEditableIndex(segments: Segment[]): number {
  for (let i = segments.length - 1; i >= 0; i--) {
    if (isEditable(segments[i])) return i;
  }
  return -1;
}
