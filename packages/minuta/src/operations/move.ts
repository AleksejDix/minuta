import type {
  DatePeriod,
  Period,
  PlainDate,
  TimePeriod,
  ZonedDateTime,
} from "#src/types";
import { isDatePeriod, isPlainDate } from "#src/values";
import { getTemporal } from "#src/temporal-api";

// The moment `nanoseconds` after `start`, in its zone
function after(start: ZonedDateTime, nanoseconds: bigint): ZonedDateTime {
  return getTemporal()
    .Instant.fromEpochNanoseconds(start.epochNanoseconds + nanoseconds)
    .toZonedDateTimeISO(start.timeZoneId);
}

/**
 * Relocate a period to start at `target`, keeping its length: days for a
 * date period, exact time for a time period.
 *
 * @example
 * const appointment = range(Temporal.ZonedDateTime.from("2026-03-29T09:00[Europe/Zurich]"), Temporal.ZonedDateTime.from("2026-03-29T10:00[Europe/Zurich]"));
 * move(appointment, Temporal.ZonedDateTime.from("2026-04-02T14:00[Europe/Zurich]"));
 * // → { start: Apr 2 14:00, end: Apr 2 15:00, unit: "custom" }
 *
 * @param period - The period to relocate
 * @param target - The new start, of the period's kind
 * @returns A custom period starting at `target` with the same length
 * @throws {TypeError} When `target` is not of the period's kind
 */
function move(period: DatePeriod, target: PlainDate): DatePeriod;
function move(period: TimePeriod, target: ZonedDateTime): TimePeriod;
function move(period: Period, target: PlainDate | ZonedDateTime): Period {
  if (isDatePeriod(period)) {
    if (!isPlainDate(target)) {
      throw new TypeError("Move a date period to a PlainDate.");
    }
    const { days } = period.start.until(period.end, { largestUnit: "day" });
    return { end: target.add({ days }), start: target, unit: "custom" };
  }
  if (isPlainDate(target)) {
    throw new TypeError("Move a time period to a ZonedDateTime.");
  }
  const length = period.end.epochNanoseconds - period.start.epochNanoseconds;
  return { end: after(target, length), start: target, unit: "custom" };
}

export { move };
