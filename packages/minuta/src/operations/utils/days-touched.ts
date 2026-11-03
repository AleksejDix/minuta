import type { Period, PlainDate } from "#src/types";
import type { WeekdayNumber } from "#src/weekday";
import { isDatePeriod } from "#src/values";

const DAYS_PER_WEEK = 7;
const ONE = 1;
const ONE_NANOSECOND = 1;
const BEFORE = 0;

function toWeekdayNumber(day: number): WeekdayNumber {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- A value modulo 7 is always 0-6
  return (day % DAYS_PER_WEEK) as WeekdayNumber;
}

/**
 * The weekday of a date, as 0 (Sunday) to 6 (Saturday).
 *
 * @param date - Any calendar date
 * @returns The weekday number
 */
function weekdayOf(date: PlainDate): WeekdayNumber {
  return toWeekdayNumber(date.dayOfWeek);
}

// The first and the last date a period touches, in its own zone for moments
function datesOf(period: Period): readonly [PlainDate, PlainDate] {
  if (isDatePeriod(period)) {
    const last = period.end.subtract({ days: ONE });
    if (last.until(period.start).sign > BEFORE) {
      return [period.start, period.start];
    }
    return [period.start, last];
  }
  const first = period.start.toPlainDate();
  if (period.end.epochNanoseconds <= period.start.epochNanoseconds) {
    return [first, first];
  }
  const last = period.end
    .subtract({ nanoseconds: ONE_NANOSECOND })
    .toPlainDate();
  return [first, last];
}

/**
 * The weekday of every day the period touches, at most one week: a date
 * period's own dates, a time period's dates in its zone.
 *
 * @param period - The period to walk
 * @returns The weekday number of each day touched
 */
function daysTouched(period: Period): WeekdayNumber[] {
  const [first, last] = datesOf(period);
  const count = Math.min(
    first.until(last, { largestUnit: "day" }).days + ONE,
    DAYS_PER_WEEK
  );
  const firstDay = first.dayOfWeek;
  return Array.from({ length: count }, (_unused, offset) =>
    toWeekdayNumber(firstDay + offset)
  );
}

export { daysTouched, weekdayOf };
