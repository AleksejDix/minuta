/**
 * StableMonth — a 42-day (6-week) grid for consistent calendar layouts.
 */
import type { Adapter, Period, Series } from "../types";
import { divide } from "../operations/divide";

export type StableMonth = Series & {
  weekStartsOn: number;
  monthStart: Date;
};

/**
 * Creates a stable month grid: 42 day periods (6 weeks)
 * starting from the week that contains the first of the month.
 */
export function createStableMonth(
  adapter: Adapter,
  weekStartsOn: number,
  date: Date
): StableMonth {
  const monthStart = adapter.startOf(date, "month");

  let gridStart = monthStart;
  const firstDayOfWeek = gridStart.getDay();
  const daysToSubtract = (firstDayOfWeek - weekStartsOn + 7) % 7;

  if (daysToSubtract > 0) {
    gridStart = adapter.add(gridStart, -daysToSubtract, "day");
  }

  const gridEnd = adapter.endOf(adapter.add(gridStart, 41, "day"), "day");
  const gridPeriod: Period = { start: gridStart, end: gridEnd, type: "day" };
  const periods = divide(adapter, gridPeriod, "day");

  return { periods, weekStartsOn, monthStart };
}
