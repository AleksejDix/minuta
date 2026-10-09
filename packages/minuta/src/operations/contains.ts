import type { Period } from "#src/types";
import { assertValidDate } from "#src/units";

/**
 * Check if a period contains a date or another period.
 *
 * @example
 * contains(period(new Date(2026, 2, 1), "month"), new Date(2026, 2, 20)); // true
 * contains(period(new Date(2026, 2, 1), "month"), period(new Date(2026, 3, 1), "day")); // false
 *
 * @param period - The containing period
 * @param target - The date or period to test
 * @returns True when the target lies fully within the period
 */
function contains(period: Period, target: Readonly<Date> | Period): boolean {
  const startTime = period.start.getTime();
  const endTime = period.end.getTime();

  if ("start" in target) {
    // Check if target period is fully contained
    return (
      target.start.getTime() >= startTime && target.end.getTime() <= endTime
    );
  }

  assertValidDate(target, "target");
  const targetTime = target.getTime();
  return targetTime >= startTime && targetTime <= endTime;
}

export { contains };
