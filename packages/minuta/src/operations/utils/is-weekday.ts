import type { Period, Units } from "#src/types";
import { DEFAULT_WEEKEND } from "#src/weekday";
import { daysTouched } from "./days-touched";

/**
 * Whether every day the period touches is a working day: not in the units'
 * `weekend` (Saturday and Sunday unless set).
 *
 * @example
 * isWeekdayWith(nativeUnits(), period(new Date(2026, 2, 18), "day")); // true (a Wednesday)
 * isWeekdayWith(nativeUnits({ weekend: ["friday", "saturday"] }), period(new Date(2026, 2, 22), "day")); // true (a Sunday)
 *
 * @param units - Units whose `weekend` to use, with `day` and `week` specs
 * @param period - The period to check
 * @returns True when the period touches no weekend day
 */
function isWeekdayWith(units: Units, period: Period): boolean {
  const weekend = units.weekend ?? DEFAULT_WEEKEND;
  return daysTouched(units, period).every((day) => !weekend.includes(day));
}

export { isWeekdayWith };
