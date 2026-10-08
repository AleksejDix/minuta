/**
 * StableMonth — a 42-day (6-week) grid for consistent calendar layouts.
 */
import type { Adapter, Period, Series } from "#src/types";
import { divide } from "#src/operations/divide";
import { weekGridStart } from "./grid-start";

type StableMonth = Series & {
  weekStartsOn: number;
  monthStart: Date;
};

const LAST_GRID_DAY_OFFSET = 41;

/**
 * Creates a stable month grid: 42 day periods (6 weeks)
 * starting from the week that contains the first of the month.
 *
 * @param adapter - The date adapter to use
 * @param weekStartsOn - First day of the week (0 = Sunday)
 * @param date - Any date within the target month
 * @returns The 42 day periods with grid metadata
 */
function createStableMonth(
  adapter: Readonly<Adapter>,
  weekStartsOn: number,
  date: Readonly<Date>
): StableMonth {
  const monthStart = adapter.startOf(date, "month");
  const gridStart = weekGridStart(adapter, weekStartsOn, monthStart);
  const gridEnd = adapter.endOf(
    adapter.add(gridStart, LAST_GRID_DAY_OFFSET, "day"),
    "day"
  );
  const gridPeriod: Period = { end: gridEnd, start: gridStart, type: "day" };
  const periods = divide(adapter, gridPeriod, "day");

  return { monthStart, periods, weekStartsOn };
}

export { createStableMonth };
export type { StableMonth };
