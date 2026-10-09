/**
 * Divide time into pieces. Every operation, ready to use: bound to the native
 * Date units with weeks starting on Monday (ISO 8601).
 *
 * For other week starts, other date libraries or a smaller bundle, use
 * `withUnits` from `minuta/core`.
 *
 * @module minuta
 */
import type { Minuta } from "#src/with-units";
import { nativeUnits } from "#src/adapters/native/index";
import { withUnits } from "#src/with-units";

const defaults: Minuta = withUnits(nativeUnits());

/**
 * Split a period into chunks of `unit`, clipped to the period. Native units,
 * weeks start on Monday; `divideWith` in `minuta/core` takes your own units.
 *
 * @example
 * divide(period(new Date(2026, 2, 1), "month"), "day"); // 31 day periods
 * divide(period(new Date(2026, 2, 1, 9), "hour"), "minute", { step: 15 }); // 4 periods
 */
const divide: Minuta["divide"] = defaults.divide;

/**
 * Whether `period` is the day containing `now`. Native units.
 *
 * @example
 * isToday(new Date(), period(new Date(), "day")); // true
 */
const isToday: Minuta["isToday"] = defaults.isToday;

/**
 * The next period of the same unit. Native units, weeks start on Monday.
 *
 * @example
 * next(period(new Date(2026, 2, 15), "month")); // April 2026
 */
const next: Minuta["next"] = defaults.next;

/**
 * The period of `unit` that contains `date`. Native units, weeks start on
 * Monday; `periodWith` in `minuta/core` takes your own units.
 *
 * @example
 * period(new Date(2026, 2, 15), "month"); // { start: Mar 1, end: Mar 31 23:59:59.999, unit: "month" }
 * period(new Date(2026, 2, 18), "week"); // Monday Mar 16 to Sunday Mar 22
 */
const period: Minuta["period"] = defaults.period;

/**
 * The previous period of the same unit. Native units, weeks start on Monday.
 *
 * @example
 * previous(period(new Date(2026, 2, 15), "month")); // February 2026
 */
const previous: Minuta["previous"] = defaults.previous;

/**
 * Whether two periods fall into the same `unit`. Native units.
 *
 * @example
 * same(period(new Date(2026, 2, 16), "day"), period(new Date(2026, 2, 20), "day"), "week"); // true
 */
const same: Minuta["same"] = defaults.same;

/**
 * Move a period by `steps` of its own unit; negative moves back. Native units.
 *
 * @example
 * shift(period(new Date(2026, 2, 15), "month"), 3); // June 2026
 */
const shift: Minuta["shift"] = defaults.shift;

export { divide, isToday, next, period, previous, same, shift };
export {
  clamp,
  contains,
  duration,
  gap,
  isWeekday,
  isWeekend,
  merge,
  move,
  overlaps,
  range,
  resize,
  snap,
  split,
} from "#src/operations/index";
export { MinutaError } from "#src/units";
export type { MinutaErrorCode } from "#src/units";
export type { DivideOptions } from "#src/operations/index";
export type { Minuta } from "#src/with-units";
export type { Period, Series, Unit, Units } from "#src/types";
