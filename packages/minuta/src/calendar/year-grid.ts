import type { Series, Units } from "#src/types";
import { divideWith } from "#src/operations/divide";
import { specFor } from "#src/units";

/**
 * The whole weeks covering a year (`periods`), the year's first day and the
 * week start the grid was built with.
 */
type YearGrid = Series &
  Readonly<{
    weekStartsOn: number;
    yearStart: Readonly<Date>;
  }>;

/**
 * A stable year grid: whole weeks from the week containing January 1 to the
 * week containing December 31. The week start comes from the `week` unit.
 *
 * @example
 * yearGridWith(nativeUnits({ weekStartsOn: 1 }), new Date(2026, 5, 1)).periods; // 53 week periods
 *
 * @param units - Available unit specs (needs `year` and `week`)
 * @param date - Any date in the target year
 * @returns The week periods with grid metadata
 */
function yearGridWith(units: Units, date: Readonly<Date>): YearGrid {
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
  return { periods, weekStartsOn: gridStart.getDay(), yearStart };
}

export { yearGridWith };
export type { YearGrid };
