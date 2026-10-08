import type { ReadonlyPeriod } from "#src/types";

/**
 * Checks if two periods share any time.
 *
 * @param first - The first period
 * @param second - The second period
 * @returns True when the periods overlap
 */
function isOverlapping(first: ReadonlyPeriod, second: ReadonlyPeriod): boolean {
  return (
    first.start.getTime() <= second.end.getTime() &&
    second.start.getTime() <= first.end.getTime()
  );
}

export { isOverlapping };
