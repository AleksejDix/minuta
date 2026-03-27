/**
 * StableMonth unit - Always returns a 42-day (6-week) grid for consistent calendar layouts
 */
import type { Adapter, Period } from "../types";
import { registerPeriodNavigator } from "../operations/periodNavigation";

/**
 * Helper to calculate the stable month grid boundaries
 */
function getStableMonthBounds(
  date: Date,
  adapter: Adapter,
  weekStartsOn: number = 1
) {
  // Get the first day of the month
  const monthStart = adapter.startOf(date, "month");

  // Find the start of the week containing the first day of the month
  let gridStart = monthStart;
  const firstDayOfWeek = gridStart.getDay();
  const daysToSubtract = (firstDayOfWeek - weekStartsOn + 7) % 7;

  if (daysToSubtract > 0) {
    gridStart = adapter.add(gridStart, -daysToSubtract, "day");
  }

  // Grid spans 42 days (6 weeks): add 41 days to get to the 42nd day
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
    date: adapter.startOf(date, "month"),
    meta: { weekStartsOn },
  };
}

registerPeriodNavigator("stableMonth", (adapter, p, steps) => {
  const weekStartsOn = (p.meta?.weekStartsOn as number) ?? 1;
  const newMonthDate = adapter.add(p.date, steps, "month");
  return createStableMonth(adapter, weekStartsOn, newMonthDate);
});
