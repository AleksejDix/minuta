/**
 * Conversions between the Temporal values minuta accepts, and comparisons
 * that work the same for native Temporal and the polyfill (`instanceof`
 * does not: they are different classes).
 */

import type {
  DatePeriod,
  Period,
  PlainDate,
  TimePeriod,
  TimeValue,
  ZonedDateTime,
} from "#src/types";
import type { Temporal } from "@js-temporal/polyfill";
import { getTemporal } from "#src/adapters/temporal/temporal-api";

const TAG_PLAIN_DATE = "Temporal.PlainDate";
const TAG_PLAIN_DATE_TIME = "Temporal.PlainDateTime";
const TAG_ZONED = "Temporal.ZonedDateTime";

// The runtime's zone, read without Temporal so it works at import time
function runtimeTimeZone(): string {
  return new Intl.DateTimeFormat().resolvedOptions().timeZone;
}

function tagOf(value: unknown): unknown {
  if (typeof value !== "object" || value === null) {
    return undefined;
  }
  return Reflect.get(value, Symbol.toStringTag);
}

function isPlainDate(value: unknown): value is PlainDate {
  return tagOf(value) === TAG_PLAIN_DATE;
}

function isPlainDateTime(
  value: unknown
): value is Readonly<Temporal.PlainDateTime> {
  return tagOf(value) === TAG_PLAIN_DATE_TIME;
}

function isZoned(value: unknown): value is ZonedDateTime {
  return tagOf(value) === TAG_ZONED;
}

/**
 * Whether a period is made of calendar dates.
 *
 * @param period - Any period
 * @returns True for a `DatePeriod`
 */
function isDatePeriod(period: Period): period is DatePeriod {
  return isPlainDate(period.start);
}

/**
 * The calendar date of a value: its own date, or the date of its moment in
 * `timeZone` (an `Instant` has no zone of its own).
 *
 * @param value - Any accepted value
 * @param timeZone - The zone an `Instant` is read in
 * @returns The calendar date
 */
function toPlainDate(value: TimeValue, timeZone: string): PlainDate {
  if (isPlainDate(value)) {
    return value;
  }
  if (isPlainDateTime(value) || isZoned(value)) {
    return value.toPlainDate();
  }
  return value.toZonedDateTimeISO(timeZone).toPlainDate();
}

/**
 * The moment of a value. A `ZonedDateTime` keeps its zone; the others are
 * placed in `timeZone`. A date becomes the start of its day, which is not
 * midnight where the clocks skip it.
 *
 * @param value - Any accepted value
 * @param timeZone - The zone values without one are placed in
 * @returns The moment
 */
function toZoned(value: TimeValue, timeZone: string): ZonedDateTime {
  if (isZoned(value)) {
    return value;
  }
  if (isPlainDate(value)) {
    return value.toZonedDateTime({ timeZone });
  }
  if (isPlainDateTime(value)) {
    return value.toZonedDateTime(timeZone);
  }
  return value.toZonedDateTimeISO(timeZone);
}

/**
 * A date period as moments in `timeZone`: from the start of its first day
 * to the start of the day after it.
 *
 * @param period - The date period
 * @param timeZone - The zone to place it in
 * @returns The same span as a time period, unit `"custom"`
 */
function zonedPeriod(period: DatePeriod, timeZone: string): TimePeriod {
  return {
    end: toZoned(period.end, timeZone),
    start: toZoned(period.start, timeZone),
    unit: "custom",
  };
}

/**
 * Compare two dates, or two moments by their instant.
 *
 * @param left - One value
 * @param right - The other, of the same kind
 * @returns A negative number, 0 or a positive number
 */
function compare(
  left: PlainDate | ZonedDateTime,
  right: PlainDate | ZonedDateTime
): number {
  if (isPlainDate(left) && isPlainDate(right)) {
    return getTemporal().PlainDate.compare(left, right);
  }
  if (isZoned(left) && isZoned(right)) {
    return getTemporal().ZonedDateTime.compare(left, right);
  }
  throw new TypeError(
    "Cannot compare a PlainDate with a ZonedDateTime: convert one of them first."
  );
}

export {
  compare,
  isDatePeriod,
  isPlainDate,
  isZoned,
  runtimeTimeZone,
  toPlainDate,
  toZoned,
  zonedPeriod,
};
