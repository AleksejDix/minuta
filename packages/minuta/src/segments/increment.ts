import type { Adapter, AdapterUnit } from "../types";
import type { DateFormat, Segment } from "./types";
import { toDate, fromDate } from "./convert";

/** Map editable segment types to adapter units */
const UNIT_MAP: Record<string, AdapterUnit> = {
  day: "day",
  month: "month",
  year: "year",
  hour: "hour",
  minute: "minute",
  second: "second",
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
 * @param direction - 1 for increment, -1 for decrement
 */
export function incrementSegment(
  adapter: Adapter,
  segments: Segment[],
  index: number,
  direction: 1 | -1,
  format: DateFormat,
  locale?: string
): Segment[] {
  const seg = segments[index];
  if (!seg || seg.type === "literal") return segments;

  const unit = UNIT_MAP[seg.type];
  if (!unit) return segments;

  const date = toDate(adapter, segments) ?? new Date();
  const newDate = adapter.add(date, direction, unit);

  return fromDate(adapter, newDate, format, locale);
}
