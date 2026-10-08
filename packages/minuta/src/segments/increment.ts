import type { Adapter, AdapterUnit } from "#src/types";
import type { DateFormat, Segment } from "./types";
import { fromDate, toDate } from "./convert";

const INCREMENT = 1;
const DECREMENT = -1;

/** Map editable segment types to adapter units */
const UNIT_MAP: Partial<Record<string, AdapterUnit>> = {
  day: "day",
  hour: "hour",
  minute: "minute",
  month: "month",
  second: "second",
  year: "year",
};

/**
 * Increment or decrement the segment at the given index.
 *
 * Uses the adapter to add/subtract, so it correctly handles:
 * - Month lengths (Jan 31 + 1 month = Feb 28)
 * - Leap years
 * - Year/day/hour boundaries
 *
 * Only works on editable segments (day, month, year, hour, minute, second).
 * Derived segments (era, weekday, dayPeriod, etc.) are not incrementable —
 * they update automatically when the date changes.
 *
 * If no valid date can be derived from the current segments
 * (e.g. empty input), returns today's date as segments.
 *
 * @param adapter - Adapter used for date arithmetic
 * @param segments - Current segments
 * @param index - Index of the segment to change
 * @param direction - 1 for increment, -1 for decrement
 * @param format - Format of the resulting segments
 * @param locale - Locale for derived segments
 * @returns The new segments, or the same array when the segment is not editable
 */
// oxlint-disable-next-line eslint/max-params -- Public API signature; an options object would break callers
function incrementSegment(
  adapter: Adapter,
  // oxlint-disable-next-line typescript/prefer-readonly-parameter-types -- Returned by identity when unchanged; readonly would change the public return type
  segments: Segment[],
  index: number,
  direction: typeof INCREMENT | typeof DECREMENT,
  format: Readonly<DateFormat>,
  locale?: string
): Segment[] {
  const seg = segments[index];
  if (seg === undefined || seg.type === "literal") {
    return segments;
  }

  const unit = UNIT_MAP[seg.type];
  if (unit === undefined) {
    return segments;
  }

  const date = toDate(adapter, segments) ?? new Date();
  const newDate = adapter.add(date, direction, unit);

  return fromDate(adapter, newDate, format, locale);
}

export { incrementSegment };
