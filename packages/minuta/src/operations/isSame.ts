import type { Period, Adapter, AdapterUnit } from "../types";

/**
 * Check if two periods are the same for a given unit.
 * For adapter units: compares start dates normalized to the unit boundary.
 * For custom: compares both start and end (exact match).
 */
export function isSame(
  adapter: Adapter,
  a: Period,
  b: Period,
  unit: AdapterUnit | "custom"
): boolean {
  if (unit === "custom") {
    return (
      a.start.getTime() === b.start.getTime() &&
      a.end.getTime() === b.end.getTime()
    );
  }

  const startA = adapter.startOf(a.start, unit);
  const startB = adapter.startOf(b.start, unit);
  return startA.getTime() === startB.getTime();
}
