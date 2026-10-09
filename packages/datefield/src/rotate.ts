import type { Segment, SegmentType } from "./types";
import { dateOf, fullYear, shownYear } from "./year";

const UP = 1;
const DOWN = -1;
const RADIX = 10;
const FIRST_MONTH = 1;
const LAST_MONTH = 12;
const FIRST_DAY = 1;
const MAX_DAYS_IN_MONTH = 31;
const FIRST_YEAR = 1;
/** 10^n - 1 is the largest n-digit number */
const LARGEST_DIGITS_OFFSET = 1;
const LAST_HOUR = 23;
const LAST_MINUTE = 59;
const LAST_SECOND = 59;
const MIDNIGHT = 0;
/** A leap year, so an unknown year allows February 29 */
const LEAP_YEAR = 2000;
/** Day 0 of the next month is the last day of this month */
const LAST_DAY_OF_PREVIOUS_MONTH = 0;
const ZERO_PAD = "0";

type Range = { readonly min: number; readonly max: number };

type Direction = typeof UP | typeof DOWN;

const FIXED_RANGES: Readonly<Partial<Record<SegmentType, Range>>> = {
  hour: { max: LAST_HOUR, min: MIDNIGHT },
  minute: { max: LAST_MINUTE, min: MIDNIGHT },
  month: { max: LAST_MONTH, min: FIRST_MONTH },
  second: { max: LAST_SECOND, min: MIDNIGHT },
};

/**
 * Parse a segment value; undefined while it still contains a gap.
 *
 * @param seg - Segment to parse
 * @returns The numeric value, or undefined
 */
function numberOf(seg: Segment | undefined): number | undefined {
  if (seg === undefined || !/^\d+$/u.test(seg.value)) {
    return undefined;
  }
  return Number.parseInt(seg.value, RADIX);
}

// The full year typed, or a leap year while it is empty
function yearOf(segments: readonly Segment[]): number {
  const seg = segments.find((part) => part.type === "year");
  const typed = numberOf(seg);
  if (seg === undefined || typed === undefined) {
    return LEAP_YEAR;
  }
  return fullYear(typed, seg.end - seg.start);
}

/**
 * Days in the month described by the segments. While month or year is
 * unknown, assume the widest possible range (31, or 29 for February).
 *
 * @param segments - Current segments
 * @returns The number of days in the month
 */
function daysInMonth(segments: readonly Segment[]): number {
  const month = numberOf(segments.find((seg) => seg.type === "month"));
  if (month === undefined || month < FIRST_MONTH || month > LAST_MONTH) {
    return MAX_DAYS_IN_MONTH;
  }
  return dateOf(yearOf(segments), month, LAST_DAY_OF_PREVIOUS_MONTH).getDate();
}

function rangeOf(
  segments: readonly Segment[],
  seg: Segment | undefined
): Range | undefined {
  if (seg === undefined) {
    return undefined;
  }
  if (seg.type === "day") {
    return { max: daysInMonth(segments), min: FIRST_DAY };
  }
  if (seg.type === "year") {
    return {
      max: RADIX ** (seg.end - seg.start) - LARGEST_DIGITS_OFFSET,
      min: FIRST_YEAR,
    };
  }
  return FIXED_RANGES[seg.type];
}

function withValue(
  segments: readonly Segment[],
  index: number,
  num: number
): Segment[] {
  return segments.map((seg, idx) => {
    if (idx !== index) {
      return seg;
    }
    return {
      end: seg.end,
      start: seg.start,
      type: seg.type,
      value: String(num).padStart(seg.end - seg.start, ZERO_PAD),
    };
  });
}

const DATE_PARTS: ReadonlySet<string> = new Set(["day", "month", "year"]);

/**
 * Whether `cursor` sits inside a day, month or year segment, past its first
 * slot: the user is still typing it.
 *
 * @param segments - Current segments
 * @param cursor - Cursor position in the text
 * @returns True while a date part is half typed
 */
function isTypingDatePart(
  segments: readonly Segment[],
  cursor: number
): boolean {
  return segments.some(
    (seg) => DATE_PARTS.has(seg.type) && cursor > seg.start && cursor < seg.end
  );
}

/**
 * Keep the day within the month's actual length — e.g. 31.02.2026 →
 * 28.02.2026. Call after every edit with the cursor: while the cursor is
 * still inside the day, month or year being typed the date stays as typed,
 * so correcting "12" to "03" never passes through "02" and cuts the day.
 * Call without a cursor (e.g. on blur) to clamp unconditionally.
 * Returns the same array when nothing changes.
 *
 * @param segments - Current segments
 * @param cursor - Cursor position after the edit, if typing
 * @returns The segments with a valid day
 */
// oxlint-disable-next-line typescript/prefer-readonly-parameter-types -- Returned by identity when unchanged; readonly would change the public return type
function clampDay(segments: Segment[], cursor?: number): Segment[] {
  if (cursor !== undefined && isTypingDatePart(segments, cursor)) {
    return segments;
  }
  const index = segments.findIndex((seg) => seg.type === "day");
  const day = numberOf(segments[index]);
  const max = daysInMonth(segments);
  if (day === undefined || day <= max) {
    return segments;
  }
  return withValue(segments, index, max);
}

function boundFor(direction: Direction, range: Range): number {
  if (direction === UP) {
    return range.min;
  }
  return range.max;
}

function wrap(value: number, range: Range): number {
  if (value > range.max) {
    return range.min;
  }
  if (value < range.min) {
    return range.max;
  }
  return value;
}

type RotateInput = {
  readonly current: number | undefined;
  readonly direction: Direction;
  readonly range: Range;
  readonly today: Readonly<Date>;
  readonly type: SegmentType;
  readonly width: number;
};

function nextValue(input: RotateInput): number {
  const { current, direction, range, today, type, width } = input;
  if (current === undefined) {
    if (type === "year") {
      return shownYear(today.getFullYear(), width);
    }
    return boundFor(direction, range);
  }
  if (type === "year") {
    return Math.min(Math.max(current + direction, range.min), range.max);
  }
  if (current > range.max || current < range.min) {
    return boundFor(direction, range);
  }
  return wrap(current + direction, range);
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
 * @param segments - Current segments
 * @param index - Index of the segment to rotate
 * @param direction - 1 for up, -1 for down
 * @param today - reference for an empty year segment
 * @returns The rotated segments, or the same array when the segment has no range
 */
// oxlint-disable-next-line eslint/max-params -- Public API signature; an options object would break callers
function rotateSegment(
  // oxlint-disable-next-line typescript/prefer-readonly-parameter-types -- Returned by identity when unchanged; readonly would change the public return type
  segments: Segment[],
  index: number,
  direction: Direction,
  today: Readonly<Date> = new Date()
): Segment[] {
  const seg = segments[index];
  const range = rangeOf(segments, seg);
  if (seg === undefined || range === undefined) {
    return segments;
  }

  const next = nextValue({
    current: numberOf(seg),
    direction,
    range,
    today,
    type: seg.type,
    width: seg.end - seg.start,
  });
  const rotated = withValue(segments, index, next);
  if (seg.type === "day") {
    return rotated;
  }
  return clampDay(rotated);
}

export { clampDay, rotateSegment };
