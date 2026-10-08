import type { Series, Units } from "#src/types";
import { divideWith } from "#src/operations/divide";
import { specFor } from "#src/units";

type MonthGrid = Series &
  Readonly<{
    monthStart: Readonly<Date>;
    weekStartsOn: number;
  }>;

const LAST_GRID_DAY_OFFSET = 41;

/**
 * A stable month grid: 42 day periods (6 weeks) starting with the week that
 * contains the first of the month. The week start comes from the `week` unit.
 *
 * @example
 * const { periods } = monthGridWith(nativeUnits({ weekStartsOn: 1 }), new Date(2026, 2, 15));
 *
 * @param units - Available unit specs (needs `month`, `week` and `day`)
 * @param date - Any date in the target month
 * @returns The 42 day periods with grid metadata
 */
function monthGridWith(units: Units, date: Readonly<Date>): MonthGrid {
  const day = specFor(units, "day");
  const monthStart = specFor(units, "month").startOf(date);
  const gridStart = specFor(units, "week").startOf(monthStart);
  const gridEnd = day.endOf(day.add(gridStart, LAST_GRID_DAY_OFFSET));
  const periods = divideWith(
    units,
    { end: gridEnd, start: gridStart, unit: "custom" },
    "day"
  );
  return { monthStart, periods, weekStartsOn: gridStart.getDay() };
}

export { monthGridWith };
export type { MonthGrid };
