/**
 * Years as typed: two-digit years in a 100-year window around today, and
 * years below 100 taken literally (`new Date(50, …)` would mean 1950).
 */

const TWO_DIGITS = 2;
const CENTURY = 100;
// CLDR's window for two-digit years: from 80 years ago to 19 years ahead
const YEARS_BEFORE = 80;
const JANUARY = 0;
const FIRST_DAY = 1;
const MIDNIGHT = 0;

/**
 * The full year a typed year stands for.
 *
 * @param value - The typed number
 * @param width - Slots of the year segment
 * @param today - Reference for the two-digit window
 * @returns The full year
 */
function fullYear(
  value: number,
  width: number,
  today: Readonly<Date> = new Date()
): number {
  if (width !== TWO_DIGITS) {
    return value;
  }
  const start = today.getFullYear() - YEARS_BEFORE;
  return start + ((((value - start) % CENTURY) + CENTURY) % CENTURY);
}

/**
 * The year as a segment of `width` slots shows it: two digits for a
 * two-slot segment, the full year otherwise.
 *
 * @param year - Full year
 * @param width - Slots of the year segment
 * @returns The number to show
 */
function shownYear(year: number, width: number): number {
  if (width === TWO_DIGITS) {
    return year % CENTURY;
  }
  return year;
}

/**
 * A local date with the year taken literally, also below 100.
 *
 * @param year - Full year
 * @param monthIndex - 0-based month
 * @param day - Day of the month; 0 is the last day of the previous month
 * @returns The date at midnight
 */
function dateOf(year: number, monthIndex: number, day: number): Date {
  const date = new Date(year, JANUARY, FIRST_DAY, MIDNIGHT);
  date.setFullYear(year, monthIndex, day);
  return date;
}

export { dateOf, fullYear, shownYear };
