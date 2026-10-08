import type { Segment, SegmentType } from "./types";

type Range = { min: number; max: number };

const FIXED_RANGES: Partial<Record<SegmentType, Range>> = {
  month: { min: 1, max: 12 },
  hour: { min: 0, max: 23 },
  minute: { min: 0, max: 59 },
  second: { min: 0, max: 59 },
};

/** Parse a segment value; undefined while it still contains a gap. */
function numberOf(seg: Segment | undefined): number | undefined {
  if (!seg || !/^\d+$/.test(seg.value)) return undefined;
  return parseInt(seg.value, 10);
}

/**
 * Days in the month described by the segments. While month or year is
 * unknown, assume the widest possible range (31, or 29 for February).
 */
function daysInMonth(segments: Segment[]): number {
  const month = numberOf(segments.find((s) => s.type === "month"));
  if (month === undefined || month < 1 || month > 12) return 31;
  const year = numberOf(segments.find((s) => s.type === "year")) ?? 2000; // leap year
  return new Date(year, month, 0).getDate();
}

function rangeOf(segments: Segment[], seg: Segment): Range | undefined {
  if (seg.type === "day") return { min: 1, max: daysInMonth(segments) };
  if (seg.type === "year") {
    return { min: 1, max: 10 ** (seg.end - seg.start) - 1 };
  }
  return FIXED_RANGES[seg.type];
}

function withValue(segments: Segment[], index: number, n: number): Segment[] {
  return segments.map((s, i) =>
    i === index ? { ...s, value: String(n).padStart(s.end - s.start, "0") } : s
  );
}

/**
 * Keep the day within the month's actual length.
 *
 * Call after any month or year change (rotation or typing) so the
 * date stays valid — e.g. 31.02.2026 → 28.02.2026.
 * Returns the same array when nothing changes.
 */
export function clampDay(segments: Segment[]): Segment[] {
  const index = segments.findIndex((s) => s.type === "day");
  const day = numberOf(segments[index]);
  const max = daysInMonth(segments);
  if (day === undefined || day <= max) return segments;
  return withValue(segments, index, max);
}

/**
 * Rotate one segment up or down, wrapping within its own range.
 *
 * Unlike `incrementSegment`, nothing carries over: day 31 → 01 keeps
 * the month, month 12 → 01 keeps the year. The day range follows the
 * actual month length, and a month or year change clamps the day.
 * The year steps without wrapping.
 *
 * An empty segment starts like a native date input: ↑ at the minimum,
 * ↓ at the maximum, and the year at the current year.
 *
 * @param direction - 1 for up, -1 for down
 * @param today - reference for an empty year segment
 */
export function rotateSegment(
  segments: Segment[],
  index: number,
  direction: 1 | -1,
  today: Date = new Date()
): Segment[] {
  const seg = segments[index];
  const range = seg && rangeOf(segments, seg);
  if (!range) return segments;

  const { min, max } = range;
  const current = numberOf(seg);
  let next: number;

  if (current === undefined) {
    next =
      seg.type === "year" ? today.getFullYear() : direction === 1 ? min : max;
  } else if (seg.type === "year") {
    next = Math.min(Math.max(current + direction, min), max);
  } else if (current > max || current < min) {
    next = direction === 1 ? min : max;
  } else {
    next = current + direction;
    if (next > max) next = min;
    if (next < min) next = max;
  }

  const rotated = withValue(segments, index, next);
  return seg.type === "day" ? rotated : clampDay(rotated);
}
