import type { Period } from "#src/types";
import type { WeekdayNumber } from "#src/weekday";

const DAYS_PER_WEEK = 7;
const ONE_DAY = 1;

function toWeekdayNumber(date: Readonly<Date>): WeekdayNumber {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Date#getDay() is always 0-6
  return date.getDay() as WeekdayNumber;
}

/**
 * The weekdays of every local day the period touches, at most one week.
 *
 * @param period - The period to walk
 * @returns The `Date#getDay()` number of each day touched
 */
function daysTouched(period: Period): WeekdayNumber[] {
  const { end, start } = period;
  const days: WeekdayNumber[] = [];
  for (let offset = 0; offset < DAYS_PER_WEEK; offset += ONE_DAY) {
    const day = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate() + offset
    );
    if (day > end) {
      break;
    }
    days.push(toWeekdayNumber(day));
  }
  return days;
}

export { daysTouched };
