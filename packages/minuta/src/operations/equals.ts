import type { Period, PlainDate, ZonedDateTime } from "#src/types";
import { isPlainDate } from "#src/values";

function sameValue(
  first: PlainDate | ZonedDateTime,
  second: PlainDate | ZonedDateTime
): boolean {
  if (isPlainDate(first)) {
    return isPlainDate(second) && first.equals(second);
  }
  return !isPlainDate(second) && first.equals(second);
}

/**
 * Whether two periods are identical, like Temporal's `equals()`: the same
 * unit and the same start and end, calendar and time zone included. For
 * "in the same week", use `same`.
 *
 * @example
 * equals(month(today), month(today)); // true
 * equals(month(today), period(march1, april1)); // false: a month and a custom period
 *
 * @param first - One period
 * @param second - The other period
 * @returns Whether both are the same period
 */
function equals(first: Period, second: Period): boolean {
  return (
    first.unit === second.unit &&
    sameValue(first.start, second.start) &&
    sameValue(first.end, second.end)
  );
}

export { equals };
