/*
 * The field's value as Temporal values instead of a Date: a date field
 * gives a Temporal.PlainDate, a time field a PlainTime, both a
 * PlainDateTime, with no time zone, as the field shows none. Temporal is
 * read from globalThis when converting, never at import, so an app can
 * load it first (minuta's temporalReady).
 */

import type { DateFormat, Segment } from "./types";
import type { DateParts, Wall } from "./convert";
import { collectParts, segmentsOf } from "./convert";
import type { Temporal } from "temporal-polyfill";

type TemporalApi = typeof Temporal;

/** A value a field shows: a date, a time, or both. */
type FieldValue =
  | Readonly<Temporal.PlainDate>
  | Readonly<Temporal.PlainDateTime>
  | Readonly<Temporal.PlainTime>;

const MISSING_TEMPORAL =
  "datefield needs Temporal for its Temporal values: load it first (minuta's temporalReady())";
const MIDNIGHT = 0;
// The day a time with no date is shown on: any day, a fixed one.
const ANY_DAY = "2000-01-01";
const REJECT = { overflow: "reject" } as const;
// The zone a wall clock's epoch milliseconds are read in.
const WALL_ZONE = "UTC";

function hasTemporal(scope: object): scope is { Temporal: TemporalApi } {
  return "Temporal" in scope && scope.Temporal !== undefined;
}

/**
 * The runtime's Temporal, read when converting.
 *
 * @returns The Temporal namespace
 * @throws {Error} When there is none
 */
function temporal(): TemporalApi {
  const scope: object = globalThis;
  if (hasTemporal(scope)) {
    return scope.Temporal;
  }
  throw new Error(MISSING_TEMPORAL);
}

/**
 * The day in the parts; undefined when they hold none, a 30 February too.
 *
 * @param parts - A field's parts
 * @returns The day, or undefined
 */
function dayOf(parts: Readonly<DateParts>): Temporal.PlainDate | undefined {
  const { day, month, year } = parts;
  if (day === undefined || month === undefined || year === undefined) {
    return undefined;
  }
  try {
    return temporal().PlainDate.from({ day, month, year }, REJECT);
  } catch {
    return undefined;
  }
}

/**
 * The time in the parts, its seconds 0 when it has none; undefined when it
 * holds no hour and minute, a 25th hour too.
 *
 * @param parts - A field's parts
 * @param needed - Whether an hour and a minute must be there (a time field)
 * @returns The time, or undefined
 */
function timeOf(
  parts: Readonly<DateParts>,
  needed: boolean
): Temporal.PlainTime | undefined {
  const { hour = MIDNIGHT, minute = MIDNIGHT, second = MIDNIGHT } = parts;
  if (needed && (parts.hour === undefined || parts.minute === undefined)) {
    return undefined;
  }
  try {
    return temporal().PlainTime.from({ hour, minute, second }, REJECT);
  } catch {
    return undefined;
  }
}

/**
 * The day a field's segments make; undefined while they make none, a 30
 * February included.
 *
 * @param segments - The field's segments
 * @returns The day, or undefined
 */
function toPlainDate(
  segments: readonly Segment[]
): Temporal.PlainDate | undefined {
  const parts = collectParts(segments);
  if (parts === undefined) {
    return undefined;
  }
  return dayOf(parts);
}

/**
 * The wall-clock time a field's segments make, its seconds 0 when the field
 * has none; undefined while they make none, a 25th hour included.
 *
 * @param segments - The field's segments
 * @returns The time, or undefined
 */
function toPlainTime(
  segments: readonly Segment[]
): Temporal.PlainTime | undefined {
  const parts = collectParts(segments);
  if (parts === undefined) {
    return undefined;
  }
  return timeOf(parts, true);
}

/**
 * The date and time a field's segments make, at midnight where it shows no
 * time; undefined while they make no day.
 *
 * @param segments - The field's segments
 * @returns The date and time, or undefined
 */
function toPlainDateTime(
  segments: readonly Segment[]
): Temporal.PlainDateTime | undefined {
  const parts = collectParts(segments);
  if (parts === undefined) {
    return undefined;
  }
  const day = dayOf(parts);
  const time = timeOf(parts, false);
  if (day === undefined || time === undefined) {
    return undefined;
  }
  return day.toPlainDateTime(time);
}

/**
 * Every field of a value: a date on a fixed day and a time at midnight
 * where it has none, so any format can be shown from it.
 *
 * @param value - The value
 * @returns Its date and time
 */
function wholeOf(value: FieldValue): Temporal.PlainDateTime {
  const api = temporal();
  if ("hour" in value && "day" in value) {
    return api.PlainDateTime.from(value);
  }
  if ("day" in value) {
    return api.PlainDate.from(value).toPlainDateTime();
  }
  return api.PlainDate.from(ANY_DAY).toPlainDateTime(value);
}

/**
 * A value's wall clock: its parts, and its moment for Intl in UTC, so the
 * runtime's time zone never moves a derived part.
 *
 * @param value - The value
 * @returns Its wall clock
 */
function wallOf(value: FieldValue): Wall {
  const at = wholeOf(value);
  return {
    at: at.toZonedDateTime(WALL_ZONE).epochMilliseconds,
    parts: {
      day: at.day,
      hour: at.hour,
      minute: at.minute,
      month: at.month,
      second: at.second,
      year: at.year,
    },
    timeZone: WALL_ZONE,
  };
}

/**
 * A value's segments in `format`: its date, its time or both, and the
 * parts the field derives (a weekday, a day period, an era) as `locale`
 * writes them, read off its wall clock, never the runtime's time zone.
 *
 * @param value - A PlainDate, a PlainTime or a PlainDateTime
 * @param format - The field's format
 * @param locale - The locale of the derived parts (en-US when unset)
 * @returns The segments
 */
function fromTemporal(
  value: FieldValue,
  format: Readonly<DateFormat>,
  locale?: string
): Segment[] {
  return segmentsOf(wallOf(value), format, locale);
}

export { fromTemporal, toPlainDate, toPlainDateTime, toPlainTime };
export type { FieldValue };
