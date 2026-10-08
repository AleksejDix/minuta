import type { Period } from "#src/types";

/**
 * Check if a period contains a date or another period.
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

  const targetTime = target.getTime();
  return targetTime >= startTime && targetTime <= endTime;
}

export { contains };
