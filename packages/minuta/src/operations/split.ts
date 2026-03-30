import type { Period } from "../types";
import { validatePeriod } from "./validate";

/**
 * Split a period at a specific date
 */
export function split(period: Period, splitDate: Date): [Period, Period] {
  validatePeriod(period);

  const splitTime = splitDate.getTime();
  const startTime = period.start.getTime();
  const endTime = period.end.getTime();

  if (splitTime <= startTime) {
    return [{ ...period, start: period.start, end: period.start }, period];
  }

  if (splitTime >= endTime) {
    return [period, { ...period, start: period.end, end: period.end }];
  }

  // Inclusive-inclusive boundaries: before ends 1ms before the split point,
  // after starts at the split point. Every millisecond belongs to exactly one half.
  const before: Period = {
    ...period,
    start: period.start,
    end: new Date(splitTime - 1),
  };

  const after: Period = {
    ...period,
    start: splitDate,
    end: period.end,
  };

  return [before, after];
}
