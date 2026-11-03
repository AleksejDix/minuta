/**
 * The built-in unit specs, computed with Temporal: date units on
 * `PlainDate`, time units on `ZonedDateTime`.
 */

import type { DateSpec, PlainDate, TimeSpec, ZonedDateTime } from "#src/types";
import type { WeekdayNumber } from "#src/weekday";
import { compare } from "#src/values";

const ONE = 1;
const EQUAL = 0;
const DAYS_PER_WEEK = 7;
const MONTHS_PER_QUARTER = 3;
const FIRST = 1;

/**
 * `diff` from an estimate, corrected to the spec's contract: the complete
 * units from `from` to `to`, truncated toward zero, as `add` counts them.
 * Temporal's `until` balances months and years differently from `add`
 * (Feb 29 plus one year is Feb 28), so its count is only the start.
 *
 * @param add - The spec's `add`
 * @param estimate - A count close to the right one
 * @returns The exact `diff`
 */
function completeDiff<Value extends PlainDate | ZonedDateTime>(
  add: (date: Value, amount: number) => Value,
  estimate: (from: Value, to: Value) => number
): (from: Value, to: Value) => number {
  return (from, to) => {
    let sign = ONE;
    if (compare(to, from) < EQUAL) {
      sign = -ONE;
    }
    let count = estimate(from, to);
    while (sign * compare(add(from, count), to) > EQUAL) {
      count -= sign;
    }
    while (sign * compare(add(from, count + sign), to) <= EQUAL) {
      count += sign;
    }
    return count;
  };
}

const day: DateSpec = {
  add: (date, amount) => date.add({ days: amount }),
  diff: (from, to) => from.until(to, { largestUnit: "day" }).days,
  kind: "date",
  startOf: (date) => date,
};

/**
 * The week spec for a week start.
 *
 * @param weekStartsOn - The first day of the week, 0 = Sunday … 6 = Saturday
 * @returns The spec
 */
function weekSpec(weekStartsOn: WeekdayNumber): DateSpec {
  return {
    add: (date, amount) => date.add({ weeks: amount }),
    diff: (from, to) =>
      Math.trunc(from.until(to, { largestUnit: "day" }).days / DAYS_PER_WEEK),
    kind: "date",
    startOf: (date) =>
      date.subtract({
        days:
          ((date.dayOfWeek % DAYS_PER_WEEK) - weekStartsOn + DAYS_PER_WEEK) %
          DAYS_PER_WEEK,
      }),
  };
}

function addMonths(date: PlainDate, amount: number): PlainDate {
  return date.add({ months: amount });
}

function addQuarters(date: PlainDate, amount: number): PlainDate {
  return date.add({ months: amount * MONTHS_PER_QUARTER });
}

function addYears(date: PlainDate, amount: number): PlainDate {
  return date.add({ years: amount });
}

function monthsUntil(from: PlainDate, to: PlainDate): number {
  return from.until(to, { largestUnit: "month" }).months;
}

const month: DateSpec = {
  add: addMonths,
  diff: completeDiff(addMonths, monthsUntil),
  kind: "date",
  startOf: (date) => date.with({ day: FIRST }),
};

const quarter: DateSpec = {
  add: addQuarters,
  diff: completeDiff(addQuarters, (from, to) =>
    Math.trunc(monthsUntil(from, to) / MONTHS_PER_QUARTER)
  ),
  kind: "date",
  startOf: (date) =>
    date.with({
      day: FIRST,
      month:
        Math.floor((date.month - FIRST) / MONTHS_PER_QUARTER) *
          MONTHS_PER_QUARTER +
        FIRST,
    }),
};

const year: DateSpec = {
  add: addYears,
  diff: completeDiff(
    addYears,
    (from, to) => from.until(to, { largestUnit: "year" }).years
  ),
  kind: "date",
  startOf: (date) => date.with({ day: FIRST, month: FIRST }),
};

// The later of two moments
function laterOf(left: ZonedDateTime, right: ZonedDateTime): ZonedDateTime {
  if (compare(left, right) < EQUAL) {
    return right;
  }
  return left;
}

/**
 * A time spec of a fixed length that follows the wall clock. A unit starts
 * at its wall-clock start, or at the zone's last clock change when that
 * comes later: where the clocks jump from 1:59 to 2:30 (Lord Howe), the hour
 * from 2:30 to 3:00 is the half of hour 2 that exists, and where they go
 * back half an hour, the repeated half hour is a unit of its own. Steps and
 * counts are exact time.
 *
 * @param smallestUnit - The Temporal unit
 * @returns The spec
 */
function fixedSpec(smallestUnit: "hour" | "minute" | "second"): TimeSpec {
  const field = `${smallestUnit}s` as const;
  return {
    add: (date, amount) => date.add({ [field]: amount }),
    diff: (from, to) => from.until(to, { largestUnit: smallestUnit })[field],
    kind: "time",
    startOf: (date) => {
      const wallStart = date.round({ roundingMode: "floor", smallestUnit });
      // The last clock change at or before `date`
      const change = date
        .add({ nanoseconds: ONE })
        .getTimeZoneTransition("previous");
      if (change === null) {
        return wallStart;
      }
      return laterOf(wallStart, change);
    },
  };
}

const hour: TimeSpec = fixedSpec("hour");
const minute: TimeSpec = fixedSpec("minute");
const second: TimeSpec = fixedSpec("second");

export {
  completeDiff,
  day,
  hour,
  minute,
  month,
  quarter,
  second,
  weekSpec,
  year,
};
