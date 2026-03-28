import type { Period } from "../../types";

/**
 * Checks if a period falls on a weekend (Saturday or Sunday)
 * @param period - The period to check
 * @returns true if the period's date is Saturday (6) or Sunday (0)
 */
export function isWeekend(p: Period): boolean {
  const day = p.start.getDay();
  return day === 0 || day === 6;
}
