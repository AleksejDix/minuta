/**
 * StableYear — a grid of 52 or 53 full weeks for year visualizations.
 */
import type { Adapter, Period, Series } from "../types";
import { divide } from "../operations/divide";

export type StableYear = Series & {
  weekStartsOn: number;
  yearStart: Date;
};

/**
 * Creates a stable year grid: 52 or 53 week periods
 * covering all weeks that contain any days of the target year.
 */
export function createStableYear(
  adapter: Adapter,
  weekStartsOn: number,
  date: Date
): StableYear {
  const yearStart = adapter.startOf(date, "year");

  let gridStart = yearStart;
  const firstDayOfWeek = gridStart.getDay();
  const daysToSubtract = (firstDayOfWeek - weekStartsOn + 7) % 7;

  if (daysToSubtract > 0) {
    gridStart = adapter.add(gridStart, -daysToSubtract, "day");
  }

  const yearEnd = adapter.endOf(date, "year");

  let gridEnd = yearEnd;
  const lastDayOfWeek = gridEnd.getDay();
  const daysToAdd = (weekStartsOn + 6 - lastDayOfWeek) % 7;

  if (daysToAdd > 0) {
    gridEnd = adapter.add(gridEnd, daysToAdd, "day");
  }

  gridEnd = adapter.endOf(gridEnd, "day");
  const gridPeriod: Period = { start: gridStart, end: gridEnd, type: "week" };
  const periods = divide(adapter, gridPeriod, "week");

  return { periods, weekStartsOn, yearStart };
}
