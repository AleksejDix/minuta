/**
 * `withUnits`: every operation bound to one set of unit specs, like
 * ibanita's `withCountries`. Each member's type is derived from its core
 * function, so the bound object and the default entry cannot drift apart.
 */

import {
  clamp,
  contains,
  divideWith,
  durationWith,
  gap,
  isTodayWith,
  isWeekday,
  isWeekend,
  length,
  mergeWith,
  move,
  nextWith,
  overlaps,
  periodWith,
  previousWith,
  range,
  resize,
  sameWith,
  shiftWith,
  snapWith,
  split,
} from "#src/operations/index";
import type { Bound } from "#src/bind";
import type { Units } from "#src/types";

/**
 * All operations, bound to one set of units.
 */
type Minuta = Readonly<{
  clamp: typeof clamp;
  contains: typeof contains;
  divide: Bound<typeof divideWith>;
  duration: Bound<typeof durationWith>;
  gap: typeof gap;
  isToday: Bound<typeof isTodayWith>;
  isWeekday: typeof isWeekday;
  isWeekend: typeof isWeekend;
  length: typeof length;
  merge: Bound<typeof mergeWith>;
  move: typeof move;
  next: Bound<typeof nextWith>;
  overlaps: typeof overlaps;
  period: Bound<typeof periodWith>;
  previous: Bound<typeof previousWith>;
  range: typeof range;
  resize: typeof resize;
  same: Bound<typeof sameWith>;
  shift: Bound<typeof shiftWith>;
  snap: Bound<typeof snapWith>;
  split: typeof split;
}>;

/**
 * Bind every operation to `units`. Pass only the units you need, or an
 * adapter's full set.
 *
 * @example
 * import { withUnits } from "minuta/core";
 * import { nativeUnits } from "minuta/native";
 *
 * const time = withUnits(nativeUnits({ weekStartsOn: 0 }));
 * time.next(time.period(new Date(), "week"));
 *
 * @param units - Unit specs to bind
 * @returns The operations without the `units` parameter
 */
function withUnits(units: Units): Minuta {
  return {
    clamp,
    contains,
    divide: (period, unit, options) => divideWith(units, period, unit, options),
    duration: (period, unit) => durationWith(units, period, unit),
    gap,
    isToday: (now, period) => isTodayWith(units, now, period),
    isWeekday,
    isWeekend,
    length,
    merge: (periods, unit) => mergeWith(units, periods, unit),
    move,
    next: (period) => nextWith(units, period),
    overlaps,
    period: (date, unit) => periodWith(units, date, unit),
    previous: (period) => previousWith(units, period),
    range,
    resize,
    same: (first, second, unit) => sameWith(units, first, second, unit),
    shift: (period, steps) => shiftWith(units, period, steps),
    snap: (date, unit, options) => snapWith(units, date, unit, options),
    split,
  };
}

export { withUnits };
export type { Minuta };
