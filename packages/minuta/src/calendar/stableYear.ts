/**
 * StableYear unit - Always returns a consistent grid of full weeks (52 or 53) for year visualizations
 */
import type { Adapter, Period } from "../types";

/**
 * Helper to calculate the stable year grid boundaries
 *
 * The stable year grid includes:
 * - All weeks that contain any days of the target year
 * - Always starts on the configured weekStartsOn day
 * - Results in 52 or 53 full weeks depending on year boundaries
 */
function getStableYearBounds(
  date: Date,
  adapter: Adapter,
  weekStartsOn: number = 1
) {
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

  return { start: gridStart, end: gridEnd };
}

/**
 * Creates a "stable year" period, which is a grid of 52 or 53 full weeks
 * that contains the given year. Useful for calendar displays like contribution graphs.
 */
export function createStableYear(
  adapter: Adapter,
  weekStartsOn: number,
  date: Date
): Period {
  const bounds = getStableYearBounds(date, adapter, weekStartsOn);

  return {
    start: bounds.start,
    end: bounds.end,
    type: "stableYear",
    meta: { weekStartsOn, yearStart: adapter.startOf(date, "year") },
  };
}
