/**
 * The calendar functions of the main entry, bound to its units.
 */
import type { DayGrid, MonthGrid, YearGrid } from "#src/calendar/index";
import type { Period, TimeValue } from "#src/types";
import { dayGridWith, monthGridWith, yearGridWith } from "#src/calendar/index";
import { isWeekdayWith, isWeekendWith } from "#src/operations/index";
import { units } from "#src/default-units";

/**
 * The real hours of the day containing `value`: 23 on a spring-forward day,
 * 25 on a fall-back day, 24 otherwise, each slot with the wall-clock hour it
 * starts in. The day lies in the zone of a moment passed in, else in the
 * runtime's zone.
 *
 * @example
 * const { periods, gapHour } = dayGrid(Temporal.ZonedDateTime.from("2024-03-10T12:00[America/New_York]"));
 * periods.length; // 23
 * gapHour; // 2
 *
 * @param value - Any value in the day
 * @returns The hour slots with the skipped and repeated hour
 */
function dayGrid(value: TimeValue): DayGrid {
  return dayGridWith(units, value);
}

/**
 * Whether every day the period touches is a working day: not Saturday or
 * Sunday (the units' `weekend` with `withUnits`).
 *
 * @example
 * isWeekday(period(Temporal.PlainDate.from("2026-03-18"), "day")); // true (a Wednesday)
 *
 * @param source - The period to check
 * @returns True when the period touches no weekend day
 */
function isWeekday(source: Period): boolean {
  return isWeekdayWith(units, source);
}

/**
 * Whether every day the period touches is a Saturday or a Sunday (the units'
 * `weekend` with `withUnits`).
 *
 * @example
 * isWeekend(period(Temporal.PlainDate.from("2026-03-21"), "day")); // true (a Saturday)
 *
 * @param source - The period to check
 * @returns True when the period lies within the weekend
 */
function isWeekend(source: Period): boolean {
  return isWeekendWith(units, source);
}

/**
 * A stable month grid: 42 day periods (6 weeks) from the Monday of the week
 * that contains the first of the month.
 *
 * @example
 * monthGrid(Temporal.PlainDate.from("2026-03-15")).periods; // 42 days from Mon Feb 23
 *
 * @param value - Any value in the month
 * @returns The 42 day periods with grid metadata
 */
function monthGrid(value: TimeValue): MonthGrid {
  return monthGridWith(units, value);
}

/**
 * A stable year grid: whole weeks, Monday first, from the week containing
 * the year's first day to the week containing its last.
 *
 * @example
 * yearGrid(Temporal.PlainDate.from("2026-06-01")).periods; // 53 week periods
 *
 * @param value - Any value in the year
 * @returns The week periods with grid metadata
 */
function yearGrid(value: TimeValue): YearGrid {
  return yearGridWith(units, value);
}

export { dayGrid, isWeekday, isWeekend, monthGrid, yearGrid };
