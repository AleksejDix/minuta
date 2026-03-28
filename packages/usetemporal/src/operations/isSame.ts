import type { Period, Adapter, AdapterUnit } from "../types";

/**
 * Check if two periods are the same for a given unit.
 * Compares period start dates normalized to the given unit.
 */
export function isSame(
  adapter: Adapter,
  a: Period,
  b: Period,
  unit: AdapterUnit | "custom"
): boolean {
  if (unit === "custom") {
    return a.start.getTime() === b.start.getTime();
  }

  const startA = adapter.startOf(a.start, unit);
  const startB = adapter.startOf(b.start, unit);
  return startA.getTime() === startB.getTime();
}
