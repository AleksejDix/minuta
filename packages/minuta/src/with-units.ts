/**
 * `withUnits`: every operation bound to one set of unit specs, like
 * ibanita's `withCountries`. Each member's type is derived from its core
 * function, so the bound object and the default entry cannot drift apart.
 */

import type { Bound, BoundPlugin, Plugin } from "#src/bind";
import {
  contains,
  divideWith,
  durationWith,
  length,
  nextWith,
  overlaps,
  periodWith,
  previousWith,
  range,
  sameWith,
  shiftWith,
} from "#src/operations/index";
import type { Units } from "#src/types";
import { bind } from "#src/bind";

/**
 * All operations, bound to one set of units.
 */
type Minuta = Readonly<{
  contains: typeof contains;
  divide: Bound<typeof divideWith>;
  duration: Bound<typeof durationWith>;
  length: typeof length;
  next: Bound<typeof nextWith>;
  overlaps: typeof overlaps;
  period: Bound<typeof periodWith>;
  previous: Bound<typeof previousWith>;
  range: typeof range;
  same: Bound<typeof sameWith>;
  shift: Bound<typeof shiftWith>;
  /** The units every member is bound to */
  units: Units;
}>;

/**
 * Options of `withUnits`.
 */
type WithUnitsOptions<Plugins extends readonly Plugin[]> = Readonly<{
  /** Plugins whose functions join the result, bound to the same units */
  plugins?: Plugins | undefined;
}>;

/**
 * The member names of `Plugins` that are already taken by `Taken` or by an
 * earlier plugin.
 */
type Clashes<Plugins, Taken extends PropertyKey> = Plugins extends readonly [
  infer First,
  ...infer Rest,
]
  ? Extract<keyof First, Taken> | Clashes<Rest, Taken | keyof First>
  : never;

/**
 * Compiles only when no plugin member clashes with an operation or with
 * another plugin; otherwise names the clashing members.
 */
type NoClashes<Plugins> = [Clashes<Plugins, keyof Minuta>] extends [never]
  ? unknown
  : Readonly<{ clashingMembers: Clashes<Plugins, keyof Minuta> }>;

/**
 * Every function of every plugin, bound.
 */
type BoundPlugins<Plugins> = Plugins extends readonly [
  infer First,
  ...infer Rest,
]
  ? BoundPlugin<First> & BoundPlugins<Rest>
  : unknown;

function operationsFor(units: Units): Minuta {
  return {
    contains,
    divide: (period, unit, options) => divideWith(units, period, unit, options),
    duration: (period, unit) => durationWith(units, period, unit),
    length,
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

/**
 * Bind every operation, and the functions of any plugins, to `units`. Pass
 * only the units you need, or an adapter's full set.
 *
 * @example
 * import { calendar } from "minuta/calendar";
 * import { nativeUnits } from "minuta/native";
 * import { withUnits } from "minuta/core";
 *
 * const time = withUnits(nativeUnits({ weekStartsOn: "sunday" }), { plugins: [calendar] });
 * time.next(time.period(new Date(), "week"));
 * time.monthGrid(new Date()); // from the plugin
 * time.units; // the units passed in
 *
 * @param units - Unit specs to bind
 * @param options - `plugins` to bind as well; member names must be unique
 * @returns The operations and plugin functions without the `units` parameter
 */
function withUnits<const Plugins extends readonly Plugin[] = []>(
  units: Units,
  options: WithUnitsOptions<Plugins> & NoClashes<Plugins> = {}
): Minuta & BoundPlugins<Plugins> {
  const { plugins = [] } = options;
  const bound = plugins.map((plugin) => bind(units, plugin));
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Object.assign over a list loses the member types; BoundPlugins<> restores them
  return Object.assign({}, operationsFor(units), ...bound) as Minuta &
    BoundPlugins<Plugins>;
}

export { withUnits };
export type { Minuta, WithUnitsOptions };
