/**
 * Years as typed: two-digit years in a 100-year window around today, and
 * years below 100 taken literally.
 */

import type { Temporal } from "./temporal-api";
import { temporal } from "./temporal-api";

const TWO_DIGITS = 2;
const CENTURY = 100;
// CLDR's window for two-digit years: from 80 years ago to 19 years ahead
const YEARS_BEFORE = 80;

/**
 * The ISO year of a day: a Hebrew or Hijri date counts by its ISO year.
 *
 * @param day - The day, today when undefined
 * @returns Its ISO year
 */
function isoYear(day?: Readonly<Temporal.PlainDate>): number {
  return (day ?? temporal().Now.plainDateISO()).withCalendar("iso8601").year;
}

/**
 * The full year a typed year stands for.
 *
 * @param value - The typed number
 * @param width - Slots of the year segment
 * @returns The full year
 */
function fullYear(value: number, width: number): number {
  if (width !== TWO_DIGITS) {
    return value;
  }
  const start = isoYear() - YEARS_BEFORE;
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
 * The days of a month, the year taken literally, also below 100.
 *
 * @param year - Full year
 * @param month - Month 1–12
 * @returns 28 to 31
 */
function daysIn(year: number, month: number): number {
  return temporal().PlainYearMonth.from({ month, year }).daysInMonth;
}

export { daysIn, fullYear, isoYear, shownYear };
