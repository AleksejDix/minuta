/**
 * The built-in unit specs, computed with Temporal: date units on
 * `PlainDate`, time units on `ZonedDateTime`.
 */

import type { DateSpec, PlainDate, TimeSpec, ZonedDateTime } from "#src/types";
import type { WeekdayNumber } from "#src/weekday";
import { compare } from "#src/values";
import { getTemporal } from "#src/temporal-api";

const ONE = 1;
const EQUAL = 0;
const DAYS_PER_WEEK = 7;
const MONTHS_PER_QUARTER = 3;
const QUARTERS_PER_YEAR = 4;
const LAST_QUARTER = 3;
const FIRST = 1;
const MONTH_DIGITS = 2;
const DECIMAL = 10;

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

/**
 * The quarter (0 to 3) a date's month belongs to, by its month code: a leap
 * month (Hebrew Adar I, `M05L`) joins the quarter of the month it repeats,
 * a 13th month (Ethiopic and Coptic Pagume, `M13`) joins the fourth.
 *
 * @param date - A date in any calendar
 * @returns The quarter's index
 */
function quarterOf(date: PlainDate): number {
  const monthNumber = Number.parseInt(
    date.monthCode.slice(FIRST, FIRST + MONTH_DIGITS),
    DECIMAL
  );
  return Math.min(
    Math.floor((monthNumber - FIRST) / MONTHS_PER_QUARTER),
    LAST_QUARTER
  );
}

/**
 * The first day of a quarter, counted in quarters since year 0 of the
 * date's calendar.
 *
 * @param date - Any date in the calendar
 * @param index - Year times 4 plus the quarter
 * @returns The quarter's first day
 */
function quarterStart(date: PlainDate, index: number): PlainDate {
  const year = Math.floor(index / QUARTERS_PER_YEAR);
  const firstMonth =
    (index - year * QUARTERS_PER_YEAR) * MONTHS_PER_QUARTER + FIRST;
  return getTemporal().PlainDate.from({
    calendar: date.calendarId,
    day: FIRST,
    monthCode: `M${String(firstMonth).padStart(MONTH_DIGITS, "0")}`,
    year,
  });
}

function quarterIndex(date: PlainDate): number {
  return date.year * QUARTERS_PER_YEAR + quarterOf(date);
}

/**
 * `amount` quarters later, the same month of the quarter and the same day,
 * clamped to the quarter's last month and the month's last day.
 *
 * @param date - Any date
 * @param amount - How many quarters
 * @returns The date
 */
function addQuarters(date: PlainDate, amount: number): PlainDate {
  const index = quarterIndex(date) + amount;
  const target = quarterStart(date, index);
  const { months } = target.until(quarterStart(date, index + ONE), {
    largestUnit: "month",
  });
  const offset = quarterStart(date, quarterIndex(date)).until(
    date.with({ day: FIRST }),
    { largestUnit: "month" }
  ).months;
  return target
    .add({ months: Math.min(offset, months - ONE) })
    .with({ day: date.day });
}

const quarter: DateSpec = {
  add: addQuarters,
  diff: completeDiff(addQuarters, (from, to) =>
    Math.trunc(monthsUntil(from, to) / MONTHS_PER_QUARTER)
  ),
  kind: "date",
  startOf: (date) => quarterStart(date, quarterIndex(date)),
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
      // No clock change in between: same offset. Skipping the search matters:
      // The polyfill scans decades back in zones that stopped changing
      if (wallStart.offsetNanoseconds === date.offsetNanoseconds) {
        return wallStart;
      }
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

export { day, hour, minute, month, quarter, second, weekSpec, year };
