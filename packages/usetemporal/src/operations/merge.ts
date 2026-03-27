import type { Period, Adapter, AdapterUnit } from "../types";
import { period } from "./period";
import { validatePeriod } from "./validate";

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

  for (const p of periods) {
    validatePeriod(p);
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
    // Verify 7 days are consecutive
    let consecutive = true;
    for (let i = 1; i < sorted.length; i++) {
      const expected = adapter.add(sorted[i - 1].start, 1, "day");
      if (
        adapter.startOf(expected, "day").getTime() !== sorted[i].start.getTime()
      ) {
        consecutive = false;
        break;
      }
    }

    if (consecutive) {
      // Check if these 7 consecutive days form a complete week
      const startOfWeek = adapter.startOf(sorted[0].date, "week");
      const endOfWeek = adapter.endOf(sorted[6].date, "week");

      if (
        start.getTime() === startOfWeek.getTime() &&
        end.getTime() === endOfWeek.getTime()
      ) {
        return period(adapter, sorted[3].date, "week");
      }
    }
  }

  if (periods.length === 3 && periods.every((p) => p.type === "month")) {
    // Check if these form a quarter - must be consecutive months in the same year
    const firstYear = sorted[0].start.getFullYear();
    const firstMonth = sorted[0].start.getMonth();

    if (
      firstMonth % 3 === 0 &&
      sorted[1].start.getFullYear() === firstYear &&
      sorted[1].start.getMonth() === firstMonth + 1 &&
      sorted[2].start.getFullYear() === firstYear &&
      sorted[2].start.getMonth() === firstMonth + 2
    ) {
      return period(adapter, sorted[1].date, "quarter");
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
