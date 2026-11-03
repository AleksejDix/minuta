import type {
  DatePeriod,
  Period,
  PlainDate,
  TimePeriod,
  ZonedDateTime,
} from "#src/types";
import { compare, isDatePeriod, isPlainDate } from "#src/values";

const EQUAL = 0;

/**
 * Split a period where the second part starts. Both parts are `"custom"`
 * periods: half a month is not a month. The first part ends where the
 * second begins, so every moment belongs to exactly one of them.
 *
 * @example
 * split(march, Temporal.PlainDate.from("2026-03-15"));
 * // [2026-03-01 – 2026-03-15, 2026-03-15 – 2026-04-01]
 * split(march, Temporal.PlainDate.from("2027-01-01")); // undefined
 *
 * @param period - The period to split
 * @param at - Where the second part starts, of the period's kind
 * @returns The two parts, or undefined unless `at` lies strictly inside
 */
function split(
  period: DatePeriod,
  at: PlainDate
): [DatePeriod, DatePeriod] | undefined;
function split(
  period: TimePeriod,
  at: ZonedDateTime
): [TimePeriod, TimePeriod] | undefined;
function split(
  period: Period,
  at: PlainDate | ZonedDateTime
): [Period, Period] | undefined {
  if (compare(at, period.start) <= EQUAL || compare(at, period.end) >= EQUAL) {
    return undefined;
  }
  if (isDatePeriod(period) && isPlainDate(at)) {
    return [
      { end: at, start: period.start, unit: "custom" },
      { end: period.end, start: at, unit: "custom" },
    ];
  }
  if (!isDatePeriod(period) && !isPlainDate(at)) {
    return [
      { end: at, start: period.start, unit: "custom" },
      { end: period.end, start: at, unit: "custom" },
    ];
  }
  return undefined;
}

export { split };
