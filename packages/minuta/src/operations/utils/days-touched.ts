import type { Period, Units } from "#src/types";
import type { WeekdayNumber } from "#src/weekday";
import { specFor } from "#src/units";

const DAYS_PER_WEEK = 7;
const ONE_DAY = 1;
const NOT_FOUND = -1;
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toWeekdayNumber(day: number): WeekdayNumber {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- A value modulo 7 is always 0-6
  return (day % DAYS_PER_WEEK) as WeekdayNumber;
}

// The weekday a date falls on in `timeZone`, as `Date#getDay()` numbers it
function weekdayIn(date: Readonly<Date>, timeZone: string): number {
  const name = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
  }).format(date);
  const index = WEEKDAYS.indexOf(name);
  if (index === NOT_FOUND) {
    throw new RangeError(`Unknown weekday "${name}"`);
  }
  return index;
}

/**
 * The weekday of every day the period touches, at most one week, read in
 * `units.timeZone` (the runtime's zone when unset) and counted with the
 * units' `day` spec.
 *
 * @param units - Units with a `day` spec
 * @param period - The period to walk
 * @returns The `Date#getDay()` number of each day touched
 */
function daysTouched(units: Units, period: Period): WeekdayNumber[] {
  const day = specFor(units, "day");
  const firstDay = day.startOf(period.start);
  const timeZone =
    units.timeZone ?? new Intl.DateTimeFormat().resolvedOptions().timeZone;
  const first = weekdayIn(firstDay, timeZone);
  const count = Math.min(
    day.diff(firstDay, period.end) + ONE_DAY,
    DAYS_PER_WEEK
  );
  return Array.from({ length: count }, (_unused, offset) =>
    toWeekdayNumber(first + offset)
  );
}

export { daysTouched };
