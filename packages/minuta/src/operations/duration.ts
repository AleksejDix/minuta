import type { ReadonlyPeriod } from "#src/types";

const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = 60_000;
const MS_PER_HOUR = 3_600_000;
const MS_PER_DAY = 86_400_000;

const DIVISORS: Readonly<Record<"day" | "hour" | "minute" | "second", number>> =
  {
    day: MS_PER_DAY,
    hour: MS_PER_HOUR,
    minute: MS_PER_MINUTE,
    second: MS_PER_SECOND,
  };

/**
 * Get the duration of a period in milliseconds, or in complete units.
 *
 * @example
 * duration(meeting)            // 5400000 (ms)
 * duration(meeting, 'hour')    // 1 (complete hours)
 * duration(meeting, 'minute')  // 90
 * @param period - The period to measure
 * @param unit - Optional unit; when omitted the result is in milliseconds
 * @returns The duration in milliseconds or complete units
 */
function duration(
  period: ReadonlyPeriod,
  unit?: "day" | "hour" | "minute" | "second"
): number {
  const ms = period.end.getTime() - period.start.getTime();
  if (unit === undefined) {
    return ms;
  }

  return Math.trunc(ms / DIVISORS[unit]);
}

export { duration };
