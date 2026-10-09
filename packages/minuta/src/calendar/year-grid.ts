import type { Period, Units } from "#src/types";
import { assertValidDate, specFor } from "#src/units";
import { DEFAULT_WEEK_START } from "#src/weekday";
import { divideWith } from "#src/operations/divide";

/**
 * The whole weeks covering a year (`periods`), the year's first day and the
 * week start the grid was built with.
 */
type YearGrid = Readonly<{
  /** The week periods covering the year */
  periods: readonly Period[];
  weekStartsOn: number;
  yearStart: Readonly<Date>;
}>;

/**
 * A stable year grid: whole weeks from the week containing January 1 to the
 * week containing December 31. The week start comes from the `week` unit.
 *
 * @example
 * yearGridWith(nativeUnits({ weekStartsOn: "monday" }), new Date(2026, 5, 1)).periods; // 53 week periods
 *
 * @param units - Available unit specs (needs `year` and `week`)
 * @param date - Any date in the target year
 * @returns The week periods with grid metadata
 */
function yearGridWith(units: Units, date: Readonly<Date>): YearGrid {
  assertValidDate(date, "date");
  const year = specFor(units, "year");
  const week = specFor(units, "week");
  const yearStart = year.startOf(date);
  const gridStart = week.startOf(yearStart);
  const gridEnd = week.endOf(year.endOf(date));
  const periods = divideWith(
    units,
    { end: gridEnd, start: gridStart, unit: "custom" },
    "week"
  );
  return {
    periods,
    weekStartsOn: units.weekStartsOn ?? DEFAULT_WEEK_START,
    yearStart,
  };
}

export { yearGridWith };
export type { YearGrid };
