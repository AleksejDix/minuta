import type { DatePeriod, PlainDate, TimeValue, Units } from "#src/types";
import { specFor, timeZoneOf } from "#src/units";
import { divideWith } from "#src/operations/divide";
import { toPlainDate } from "#src/values";
import { weekdayOf } from "#src/operations/utils/days-touched";

/**
 * A 42-day month grid (`periods`), the month's first day and the week start
 * the grid was built with.
 */
type MonthGrid = Readonly<{
  monthStart: PlainDate;
  /** The 42 day periods, row by row */
  periods: readonly DatePeriod[];
  /** The weekday the grid starts on, 0 = Sunday … 6 = Saturday */
  weekStartsOn: number;
}>;

const GRID_DAYS = 42;

/**
 * A stable month grid: 42 day periods (6 weeks) starting with the week that
 * contains the first of the month. The week start comes from the `week` unit.
 *
 * @example
 * const { periods } = monthGridWith(temporalUnits({ weekStartsOn: "monday" }), Temporal.PlainDate.from("2026-03-15"));
 *
 * @param units - Available unit specs (needs `month`, `week` and `day`)
 * @param value - Any value in the target month
 * @returns The 42 day periods with grid metadata
 */
function monthGridWith(units: Units, value: TimeValue): MonthGrid {
  const monthStart = specFor(units, "month").startOf(
    toPlainDate(value, timeZoneOf(units))
  );
  const gridStart = specFor(units, "week").startOf(monthStart);
  const grid: DatePeriod = {
    end: gridStart.add({ days: GRID_DAYS }),
    start: gridStart,
    unit: "custom",
  };
  return {
    monthStart,
    periods: divideWith(units, grid, "day"),
    /*
     * The weekday the grid starts on, so it matches the periods even when
     * hand-built units have a week spec but no `weekStartsOn` setting
     */
    weekStartsOn: weekdayOf(gridStart),
  };
}

export { monthGridWith };
export type { MonthGrid };
