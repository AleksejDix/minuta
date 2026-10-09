import type { Period } from "#src/types";

/**
 * Checks if two periods share any time.
 *
 * @example
 * overlaps(range(new Date(2026, 2, 1), new Date(2026, 2, 10)), range(new Date(2026, 2, 5), new Date(2026, 2, 20))); // true
 *
 * @param first - The first period
 * @param second - The second period
 * @returns True when the periods overlap
 */
function overlaps(first: Period, second: Period): boolean {
  return (
    first.start.getTime() <= second.end.getTime() &&
    second.start.getTime() <= first.end.getTime()
  );
}

export { overlaps };
