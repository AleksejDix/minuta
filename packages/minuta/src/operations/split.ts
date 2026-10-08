import type { Period } from "#src/types";

const ONE_MS = 1;

function withBounds(
  period: Period,
  start: Readonly<Date>,
  end: Readonly<Date>
): Period {
  return { end, start, unit: period.unit };
}

/**
 * Split a period at a specific date
 *
 * @param period - The period to split
 * @param splitDate - The date at which the second half starts
 * @returns The part before the split date and the part from the split date on
 */
function split(period: Period, splitDate: Readonly<Date>): [Period, Period] {
  const splitTime = splitDate.getTime();

  if (splitTime <= period.start.getTime()) {
    return [withBounds(period, period.start, period.start), period];
  }

  if (splitTime >= period.end.getTime()) {
    return [period, withBounds(period, period.end, period.end)];
  }

  /*
   * Inclusive-inclusive boundaries: before ends 1ms before the split point,
   * after starts at the split point. Every millisecond belongs to exactly one half.
   */
  const before = withBounds(period, period.start, new Date(splitTime - ONE_MS));
  const after = withBounds(period, splitDate, period.end);

  return [before, after];
}

export { split };
