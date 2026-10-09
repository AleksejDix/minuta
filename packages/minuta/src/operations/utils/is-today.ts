import type { Period, Units } from "#src/types";
import { periodWith } from "#src/operations/period";
import { sameWith } from "#src/operations/same";

/**
 * Whether `period` is the day that contains `now`.
 *
 * @example
 * isTodayWith(nativeUnits(), new Date(), periodWith(nativeUnits(), new Date(), "day")); // true
 *
 * @param units - Available unit specs (needs `day`)
 * @param now - The current moment
 * @param period - Period to check; only day periods can be today
 * @returns Whether the period is today
 */
function isTodayWith(
  units: Units,
  now: Readonly<Date>,
  period: Period
): boolean {
  if (period.unit !== "day") {
    return false;
  }
  return sameWith(units, period, periodWith(units, now, "day"), "day");
}

export { isTodayWith };
