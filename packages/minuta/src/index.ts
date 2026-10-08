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

const divide: Minuta["divide"] = defaults.divide;
const isToday: Minuta["isToday"] = defaults.isToday;
const next: Minuta["next"] = defaults.next;
const period: Minuta["period"] = defaults.period;
const previous: Minuta["previous"] = defaults.previous;
const same: Minuta["same"] = defaults.same;
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
