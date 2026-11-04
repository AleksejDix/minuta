/**
 * `withUnits`: every operation bound to one set of unit specs, like
 * ibanita's `withCountries`. A test checks it against the default entry,
 * so the two cannot drift apart.
 */

import type { Chunks, DivideOptions } from "#src/operations/divide";
import type { Period, PeriodOf, TimeValue, Unit, Units } from "#src/types";
import {
  contains,
  divideWith,
  durationWith,
  nextWith,
  overlaps,
  periodWith,
  previousWith,
  range,
  sameWith,
  shiftWith,
} from "#src/operations/index";

/**
 * All operations, bound to one set of units. Written out rather than
 * derived, so the generic signatures keep their type parameters: a day's
 * `period` is a `DatePeriod`, `next` of a `TimePeriod` a `TimePeriod`.
 */
type Minuta = Readonly<{
  contains: typeof contains;
  divide: <Source extends Period, Name extends Unit>(
    period: Source,
    unit: Name,
    options?: DivideOptions
  ) => Chunks<Source, Name>;
  duration: (period: Period, unit: Unit) => number;
  next: <Source extends Period>(period: Source) => Source;
  overlaps: typeof overlaps;
  period: <Name extends Unit>(value: TimeValue, unit: Name) => PeriodOf<Name>;
  previous: <Source extends Period>(period: Source) => Source;
  range: typeof range;
  same: (first: Period, second: Period, unit: Unit | "custom") => boolean;
  shift: <Source extends Period>(period: Source, steps: number) => Source;
  /** The units every member is bound to */
  units: Units;
}>;

/**
 * Bind every operation to `units`. Pass only the units you need, or the
 * full set of `createUnits()`. For the calendar and interval functions, use
 * `calendar(units)` and `intervals(units)` from their entries.
 *
 * @example
 * import { createUnits, withUnits } from "@aleksejdix/minuta/core";
 *
 * const time = withUnits(createUnits({ weekStartsOn: "sunday" }));
 * time.next(time.period(Temporal.Now.plainDateISO(), "week"));
 * time.units; // the units passed in
 *
 * @param units - Unit specs to bind
 * @returns The operations without the `units` parameter
 */
function withUnits(units: Units): Minuta {
  return {
    contains,
    divide: (period, unit, options) => divideWith(units, period, unit, options),
    duration: (period, unit) => durationWith(units, period, unit),
    next: (period) => nextWith(units, period),
    overlaps,
    period: (date, unit) => periodWith(units, date, unit),
    previous: (period) => previousWith(units, period),
    range,
    same: (first, second, unit) => sameWith(units, first, second, unit),
    shift: (period, steps) => shiftWith(units, period, steps),
    units,
  };
}

export { withUnits };
export type { Minuta };
