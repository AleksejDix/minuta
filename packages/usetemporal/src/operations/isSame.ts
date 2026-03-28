import type { Period, Adapter, AdapterUnit } from "../types";

/**
 * Check if two periods are the same for a given unit
 *
 * Compares period start dates normalized to the given unit.
 *
 * @example
 * isSame(adapter, yearPeriod, otherYearPeriod, 'year')
 */
export function isSame(
  adapter: Adapter,
  a: Period | null | undefined,
  b: Period | null | undefined,
  unit: AdapterUnit | "custom"
): boolean {
  if (!a || !b) return false;

  // Handle custom periods - same if start times are exactly equal
  if (unit === "custom") {
    return a.start.getTime() === b.start.getTime();
  }

  // For all other units, compare by checking if startOf values are equal
  const startA = adapter.startOf(a.start, unit);
  const startB = adapter.startOf(b.start, unit);
  return startA.getTime() === startB.getTime();
}
