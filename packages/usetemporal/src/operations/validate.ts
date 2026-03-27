import type { Period } from "../types";

/**
 * Validate that a period has valid dates and start <= end.
 * Only used at entry points where invalid input causes catastrophic behavior
 * (infinite loops, silent corruption).
 */
export function validatePeriod(p: Period): void {
  if (isNaN(p.start.getTime()) || isNaN(p.end.getTime())) {
    throw new Error("Period contains invalid date");
  }
  if (p.start.getTime() > p.end.getTime()) {
    throw new Error("Period start must be before or equal to end");
  }
}
