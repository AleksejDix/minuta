import type { Period } from "../types";

/**
 * Validate that a period has valid dates and start <= end.
 * Only used at entry points where invalid input causes catastrophic behavior
 * (infinite loops, silent corruption).
 */
export function validatePeriod(p: Period): void {
  if (isNaN(p.start.getTime()) || isNaN(p.end.getTime())) {
    throw new Error(
      `Period contains invalid date: start=${p.start}, end=${p.end}`
    );
  }
  if (p.start.getTime() > p.end.getTime()) {
    throw new Error(
      `Period start (${p.start.toISOString()}) must be before or equal to end (${p.end.toISOString()})`
    );
  }
}
