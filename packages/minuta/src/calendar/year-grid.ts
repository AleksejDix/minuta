import type { DatePeriod, PlainDate, TimeValue, Units } from "#src/types";
import { divideWith } from "#src/operations/divide";
import { specFor } from "#src/units";
import { toPlainDate } from "#src/values";
import { weekdayOf } from "#src/operations/utils/days-touched";

const ONE = 1;

/**
 * The whole weeks covering a year (`periods`), the year's first day and the
 * week start the grid was built with.
 */
type YearGrid = Readonly<{
  /** The week periods covering the year */
  periods: readonly DatePeriod[];
  /** The weekday the grid starts on, 0 = Sunday … 6 = Saturday */
  weekStartsOn: number;
  yearStart: PlainDate;
}>;

/**
 * A stable year grid: whole weeks from the week containing January 1 to the
 * week containing December 31. The week start comes from the `week` unit.
 *
 * @example
 * yearGridWith(createUnits({ weekStartsOn: "monday" }), Temporal.PlainDate.from("2026-06-01")).periods; // 53 week periods
 *
 * @param units - Available unit specs (needs `year` and `week`)
 * @param value - Any value in the target year
 * @returns The week periods with grid metadata
 */
function yearGridWith(units: Units, value: TimeValue): YearGrid {
  const year = specFor(units, "year");
  const week = specFor(units, "week");
  const yearStart = year.startOf(toPlainDate(value));
  const lastDay = year.add(yearStart, ONE).subtract({ days: ONE });
  const gridStart = week.startOf(yearStart);
  const grid: DatePeriod = {
    end: week.add(week.startOf(lastDay), ONE),
    start: gridStart,
    unit: "custom",
  };
  return {
    periods: divideWith(units, grid, "week"),
    /*
     * The weekday the grid starts on, so it matches the periods even when
     * hand-built units have a week spec but no `weekStartsOn` setting
     */
    weekStartsOn: weekdayOf(gridStart),
    yearStart,
  };
}

export { yearGridWith };
export type { YearGrid };
