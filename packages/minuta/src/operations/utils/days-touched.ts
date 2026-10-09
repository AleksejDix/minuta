import type { Period, Units } from "#src/types";
import { DEFAULT_WEEK_START } from "#src/weekday";
import type { WeekdayNumber } from "#src/weekday";
import { specFor } from "#src/units";

const DAYS_PER_WEEK = 7;
const ONE_DAY = 1;

function toWeekdayNumber(day: number): WeekdayNumber {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- A value modulo 7 is always 0-6
  return (day % DAYS_PER_WEEK) as WeekdayNumber;
}

/**
 * The weekday of every day the period touches, at most one week, counted
 * with the units' `day` and `week` specs so the adapter's time zone applies.
 *
 * @param units - Units with `day` and `week` specs
 * @param period - The period to walk
 * @returns The `Date#getDay()` number of each day touched
 */
function daysTouched(units: Units, period: Period): WeekdayNumber[] {
  const day = specFor(units, "day");
  const firstDay = day.startOf(period.start);
  const weekStart = specFor(units, "week").startOf(firstDay);
  const first =
    (units.weekStartsOn ?? DEFAULT_WEEK_START) + day.diff(weekStart, firstDay);
  const count = Math.min(
    day.diff(firstDay, period.end) + ONE_DAY,
    DAYS_PER_WEEK
  );
  return Array.from({ length: count }, (_unused, offset) =>
    toWeekdayNumber(first + offset)
  );
}

export { daysTouched };
