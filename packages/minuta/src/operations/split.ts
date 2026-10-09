import type { Period } from "#src/types";

const ONE_MS = 1;

function custom(start: Readonly<Date>, end: Readonly<Date>): Period {
  return { end, start, unit: "custom" };
}

/**
 * Split a period at a date inside it. Both parts are `"custom"` periods:
 * half a month is not a month.
 *
 * @example
 * const parts = split(period(new Date(2026, 2, 1), "month"), new Date(2026, 2, 15));
 * // [Mar 1 – Mar 14 23:59:59.999, Mar 15 – Mar 31 23:59:59.999]
 * split(period(new Date(2026, 2, 1), "month"), new Date(2027, 0, 1)); // undefined
 *
 * @param period - The period to split
 * @param splitDate - The date at which the second part starts
 * @returns The part before the date and the part from the date on, or
 *   undefined when the date is not after the start and within the period
 */
function split(
  period: Period,
  splitDate: Readonly<Date>
): [Period, Period] | undefined {
  const splitTime = splitDate.getTime();
  if (splitTime <= period.start.getTime() || splitTime > period.end.getTime()) {
    return undefined;
  }

  /*
   * Inclusive-inclusive boundaries: before ends 1ms before the split point,
   * after starts at the split point. Every millisecond belongs to exactly one half.
   */
  return [
    custom(period.start, new Date(splitTime - ONE_MS)),
    custom(new Date(splitTime), period.end),
  ];
}

export { split };
