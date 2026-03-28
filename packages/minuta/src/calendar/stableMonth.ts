/**
 * StableMonth unit - Always returns a 42-day (6-week) grid for consistent calendar layouts
 */
import type { Adapter, Period } from "../types";

/**
 * Helper to calculate the stable month grid boundaries
 */
function getStableMonthBounds(
  date: Date,
  adapter: Adapter,
  weekStartsOn: number = 1
) {
  const monthStart = adapter.startOf(date, "month");

  let gridStart = monthStart;
  const firstDayOfWeek = gridStart.getDay();
  const daysToSubtract = (firstDayOfWeek - weekStartsOn + 7) % 7;

  if (daysToSubtract > 0) {
    gridStart = adapter.add(gridStart, -daysToSubtract, "day");
  }

  const gridEnd = adapter.add(gridStart, 41, "day");
  const gridEndTime = adapter.endOf(gridEnd, "day");

  return { start: gridStart, end: gridEndTime };
}

/**
 * Creates a "stable month" period, which is a 6-week (42-day) grid
 * that contains the given month, useful for calendar displays.
 */
export function createStableMonth(
  adapter: Adapter,
  weekStartsOn: number,
  date: Date
): Period {
  const bounds = getStableMonthBounds(date, adapter, weekStartsOn);

  return {
    start: bounds.start,
    end: bounds.end,
    type: "stableMonth",
    meta: { weekStartsOn, monthStart: adapter.startOf(date, "month") },
  };
}
