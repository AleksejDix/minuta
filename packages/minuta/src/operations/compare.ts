import type { Period } from "#src/types";
import { compare as compareValues } from "#src/values";
import { sameKind } from "./kinds";

const EQUAL = 0;

/**
 * Order two periods by their start, then by their end, like Temporal's
 * `compare()`: a sort callback. Next to a time period, a date period becomes
 * moments in that period's zone.
 *
 * @example
 * [april, march].sort(compare); // [march, april]
 * compare(monday, week); // -1: the same start, the day ends first
 *
 * @param first - One period
 * @param second - The other period
 * @returns A negative number, 0 or a positive number
 */
function compare(first: Period, second: Period): number {
  const [left, right] = sameKind(first, second);
  const byStart = compareValues(left.start, right.start);
  if (byStart !== EQUAL) {
    return byStart;
  }
  return compareValues(left.end, right.end);
}

export { compare };
