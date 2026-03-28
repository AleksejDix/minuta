import type { Period } from "../../types";

/**
 * Checks if two periods share any time.
 */
export function isOverlapping(a: Period, b: Period): boolean {
  return (
    a.start.getTime() <= b.end.getTime() && b.start.getTime() <= a.end.getTime()
  );
}
