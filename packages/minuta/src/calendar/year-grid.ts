import type { Series, Units } from "#src/types";
import { divideWith } from "#src/operations/divide";
import { specFor } from "#src/units";

type YearGrid = Series &
  Readonly<{
    weekStartsOn: number;
    yearStart: Readonly<Date>;
  }>;

/**
 * A stable year grid: whole weeks from the week containing January 1 to the
 * week containing December 31. The week start comes from the `week` unit.
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
