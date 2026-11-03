/**
 * Bringing two periods to the same kind. A date period next to a time
 * period becomes moments in that time period's zone, so the two can be
 * compared edge to edge.
 */

import { isDatePeriod, zonedPeriod } from "#src/values";
import type { Period } from "#src/types";

/**
 * Both periods as the same kind: unchanged when they already are, else the
 * date period as moments in the other period's zone.
 *
 * @param first - One period
 * @param second - The other period
 * @returns The two periods, of one kind
 */
function sameKind(first: Period, second: Period): readonly [Period, Period] {
  if (isDatePeriod(first) === isDatePeriod(second)) {
    return [first, second];
  }
  if (isDatePeriod(first) && !isDatePeriod(second)) {
    return [zonedPeriod(first, second.start.timeZoneId), second];
  }
  if (isDatePeriod(second) && !isDatePeriod(first)) {
    return [first, zonedPeriod(second, first.start.timeZoneId)];
  }
  return [first, second];
}

export { sameKind };
