import type { Period } from "#src/types";
import { compare } from "#src/values";
import { sameKind } from "./kinds";

const EQUAL = 0;

/**
 * Whether two periods share any time. Periods that only touch (one ends
 * where the other starts) do not overlap. Next to a time period, a date
 * period becomes moments in that period's zone.
 *
 * @example
 * overlaps(march, april); // false: they touch
 * overlaps(march, week(Temporal.PlainDate.from("2026-03-31"))); // true
 *
 * @param first - The first period
 * @param second - The second period
 * @returns True when the periods overlap
 */
function overlaps(first: Period, second: Period): boolean {
  const [left, right] = sameKind(first, second);
  return (
    compare(left.start, right.end) < EQUAL &&
    compare(right.start, left.end) < EQUAL
  );
}

export { overlaps };
