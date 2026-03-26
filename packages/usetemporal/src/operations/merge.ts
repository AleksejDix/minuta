import type { Period, Adapter, AdapterUnit } from "../types";
import { period } from "./period";

/**
 * Merge multiple periods into a single period
 */
export function merge(
  adapter: Adapter,
  periods: Period[],
  targetUnit?: AdapterUnit
): Period | null {
  if (periods.length === 0) {
    throw new Error("merge() requires at least one period");
  }
  if (periods.length === 1) {
    // If target unit is specified, promote the single period to that unit
    if (targetUnit && targetUnit !== periods[0].type) {
      return period(adapter, periods[0].date, targetUnit);
    }
    return periods[0];
  }

  // Sort periods by start time
  const sorted = [...periods].sort(
    (a, b) => a.start.getTime() - b.start.getTime()
  );

  const start = sorted[0].start;
  const end = sorted[sorted.length - 1].end;

  // Check for natural units
  if (periods.length === 7 && periods.every((p) => p.type === "day")) {
    // Check if these 7 days form a complete week
    const startOfWeek = adapter.startOf(periods[0].date, "week");
    const endOfWeek = adapter.endOf(periods[6].date, "week");

    if (
      start.getTime() === startOfWeek.getTime() &&
      end.getTime() === endOfWeek.getTime()
    ) {
      return period(adapter, periods[3].date, "week"); // Middle day
    }
  }

  if (periods.length === 3 && periods.every((p) => p.type === "month")) {
    // Check if these form a quarter - they must be consecutive months
    const months = sorted.map((p) => p.date.getMonth());
    const firstMonth = months[0];

    // Check if it's a valid quarter start (0, 3, 6, 9) and consecutive
    if (
      firstMonth % 3 === 0 &&
      months[1] === firstMonth + 1 &&
      months[2] === firstMonth + 2
    ) {
      return period(adapter, periods[1].date, "quarter");
    }
  }

  // If target unit is specified, return period with exact start/end times
  if (targetUnit) {
    // Use the first period's date as reference to preserve it
    const referenceDate = sorted[0].date;
    return {
      start,
      end,
      type: targetUnit,
      date: referenceDate,
    };
  }

  // Return custom period
  return {
    start,
    end,
    type: "custom",
    date: sorted[0].date, // Preserve reference date from first period
  };
}
