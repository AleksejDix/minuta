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
    return [
      { start: period.start, end: period.start, type: period.type },
      period,
    ];
  }

  if (splitTime >= endTime) {
    return [period, { start: period.end, end: period.end, type: period.type }];
  }

  const before: Period = {
    start: period.start,
    end: new Date(splitTime - 1),
    type: period.type,
  };

  const after: Period = {
    start: splitDate,
    end: period.end,
    type: period.type,
  };

  return [before, after];
}
