/**
 * Binding: turn context-first functions `(units, ...args)` into functions
 * that only take `...args`. This is how plugins (calendar grids, your own
 * operations) get the same convenience as the default entry.
 */

import type { Units } from "#src/types";

/**
 * A context-first function: unit specs first, then its own arguments.
 */
type WithUnits = (units: Units, ...args: readonly never[]) => unknown;

/**
 * An object of context-first functions, such as `calendar`.
 */
type Plugin = Readonly<Record<string, WithUnits>>;

/**
 * `Fn` without its leading `units` parameter.
 */
type Bound<Fn> = Fn extends (units: Units, ...args: infer Args) => infer Result
  ? (...args: Args) => Result
  : never;

/**
 * Every function of a plugin, bound to one set of units.
 */
type BoundPlugin<Functions> = Readonly<{
  [Name in keyof Functions]: Bound<Functions[Name]>;
}>;

/**
 * Bind every function of `plugin` to `units`.
 *
 * @example
 * import { calendar } from "minuta/calendar";
 * const grids = bind(nativeUnits({ weekStartsOn: "sunday" }), calendar);
 * grids.monthGrid(new Date());
 *
 * @param units - Unit specs to bind
 * @param plugin - Object of context-first functions
 * @returns The same functions without the `units` parameter
 */
function bind<Functions extends Plugin>(
  units: Units,
  plugin: Functions
): BoundPlugin<Functions> {
  const entries = Object.entries(plugin).map(
    ([name, fn]: readonly [string, WithUnits]) => [
      name,
      (...args: readonly never[]): unknown => fn(units, ...args),
    ]
  );
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Object.fromEntries returns any; Bound<> restores the name-to-signature mapping
  return Object.fromEntries(entries) as BoundPlugin<Functions>;
}

export { bind };
export type { Bound, BoundPlugin, Plugin, WithUnits };
