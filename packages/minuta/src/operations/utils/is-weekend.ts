import type { Period, Units } from "#src/types";
import { DEFAULT_WEEKEND } from "#src/weekday";
import { daysTouched } from "./days-touched";

/**
 * Whether every day the period touches is a weekend day, as configured by
 * the units' `weekend` (Saturday and Sunday unless set).
 *
 * @example
 * isWeekendWith(nativeUnits(), period(new Date(2026, 2, 21), "day")); // true (a Saturday)
 * isWeekendWith(nativeUnits({ weekend: ["friday", "saturday"] }), period(new Date(2026, 2, 20), "day")); // true (a Friday)
 *
 * @param units - Units whose `weekend` to use
 * @param period - The period to check
 * @returns True when the period lies within the weekend
 */
function isWeekendWith(units: Units, period: Period): boolean {
  const weekend = units.weekend ?? DEFAULT_WEEKEND;
  return daysTouched(period).every((day) => weekend.includes(day));
}

export { isWeekendWith };
