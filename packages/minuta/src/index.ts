/**
 * Divide time into pieces. Every operation, ready to use: bound to the native
 * Date units with weeks starting on Monday (ISO 8601).
 *
 * For other week starts, other date libraries or a smaller bundle, use
 * `withUnits` from `minuta/core`.
 *
 * @module minuta
 */
import {
  divideWith,
  durationWith,
  nextWith,
  periodWith,
  previousWith,
  sameWith,
  shiftWith,
} from "#src/operations/index";
import type { Minuta } from "#src/with-units";
import { nativeUnits } from "#src/adapters/native/index";

/*
 * Each function binds the units on its own, so bundlers drop the unused
 * ones. The types come from `Minuta`, so this entry and `withUnits` cannot
 * drift apart.
 */
// oxlint-disable-next-line eslint/no-inline-comments -- The pure marker lets bundlers drop the units when no bound function is used
const units = /* @__PURE__ */ nativeUnits();

/**
 * Split a period into chunks of `unit`, clipped to the period. Native units,
 * weeks start on Monday; `divideWith` in `minuta/core` takes your own units.
 *
 * @example
 * divide(period(new Date(2026, 2, 1), "month"), "day"); // 31 day periods
 * divide(period(new Date(2026, 2, 1, 9), "hour"), "minute", { step: 15 }); // 4 periods
 *
 * @param args - The arguments of `divideWith` after `units`
 * @returns The chunks, clipped to the period
 */
function divide(
  ...args: Readonly<Parameters<Minuta["divide"]>>
): ReturnType<Minuta["divide"]> {
  return divideWith(units, ...args);
}

/**
 * How many complete `unit`s fit into a period. Native units, calendar- and
 * DST-aware; `durationWith` in `minuta/core` takes your own units.
 *
 * @example
 * duration(period(new Date(2026, 9, 8), "day"), "hour"); // 24
 * duration(period(new Date(2026, 1, 1), "month"), "day"); // 28
 *
 * @param args - The arguments of `durationWith` after `units`
 * @returns The number of complete units
 */
function duration(
  ...args: Readonly<Parameters<Minuta["duration"]>>
): ReturnType<Minuta["duration"]> {
  return durationWith(units, ...args);
}

/**
 * The next period of the same unit. Native units, weeks start on Monday.
 *
 * @example
 * next(period(new Date(2026, 2, 15), "month")); // April 2026
 *
 * @param args - The arguments of `nextWith` after `units`
 * @returns The following period of the same unit
 */
function next(
  ...args: Readonly<Parameters<Minuta["next"]>>
): ReturnType<Minuta["next"]> {
  return nextWith(units, ...args);
}

/**
 * The period of `unit` that contains `date`. Native units, weeks start on
 * Monday; `periodWith` in `minuta/core` takes your own units.
 *
 * @example
 * period(new Date(2026, 2, 15), "month"); // { start: Mar 1, end: Mar 31 23:59:59.999, unit: "month" }
 * period(new Date(2026, 2, 18), "week"); // Monday Mar 16 to Sunday Mar 22
 *
 * @param args - The arguments of `periodWith` after `units`
 * @returns The period of `unit` containing `date`
 */
function period(
  ...args: Readonly<Parameters<Minuta["period"]>>
): ReturnType<Minuta["period"]> {
  return periodWith(units, ...args);
}

/**
 * The previous period of the same unit. Native units, weeks start on Monday.
 *
 * @example
 * previous(period(new Date(2026, 2, 15), "month")); // February 2026
 *
 * @param args - The arguments of `previousWith` after `units`
 * @returns The preceding period of the same unit
 */
function previous(
  ...args: Readonly<Parameters<Minuta["previous"]>>
): ReturnType<Minuta["previous"]> {
  return previousWith(units, ...args);
}

/**
 * Whether two periods fall into the same `unit`. Native units.
 *
 * @example
 * same(period(new Date(2026, 2, 16), "day"), period(new Date(2026, 2, 20), "day"), "week"); // true
 *
 * @param args - The arguments of `sameWith` after `units`
 * @returns Whether both periods are in the same unit
 */
function same(
  ...args: Readonly<Parameters<Minuta["same"]>>
): ReturnType<Minuta["same"]> {
  return sameWith(units, ...args);
}

/**
 * Move a period by `steps` of its own unit; negative moves back. Native units.
 *
 * @example
 * shift(period(new Date(2026, 2, 15), "month"), 3); // June 2026
 *
 * @param args - The arguments of `shiftWith` after `units`
 * @returns The moved period
 */
function shift(
  ...args: Readonly<Parameters<Minuta["shift"]>>
): ReturnType<Minuta["shift"]> {
  return shiftWith(units, ...args);
}

export { divide, duration, next, period, previous, same, shift };
export { contains, length, overlaps, range } from "#src/operations/index";
export { MinutaError } from "#src/units";
export type { MinutaErrorCode } from "#src/units";
export type { DivideOptions } from "#src/operations/index";
export type { Minuta } from "#src/with-units";
export type { Period, Unit, Units } from "#src/types";
export type { Weekday } from "#src/weekday";
