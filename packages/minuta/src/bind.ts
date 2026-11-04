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
 * Marks a plugin function with the signature it has once bound. Binding
 * through a conditional type keeps only the last overload of a function and
 * none of its type parameters; a function that has overloads or type
 * parameters names its bound form here instead.
 */
type BoundAs<Shape> = Readonly<{ "~bound"?: Shape }>;

/**
 * `Fn` without its leading `units` parameter: the signature it names with
 * `BoundAs`, else its own parameters after `units`.
 */
type Bound<Fn> =
  Fn extends BoundAs<infer Shape>
    ? unknown extends Shape
      ? Unmarked<Fn>
      : Shape
    : Unmarked<Fn>;

type Unmarked<Fn> = Fn extends (
  units: Units,
  ...args: infer Args
) => infer Result
  ? (...args: Args) => Result
  : never;

/**
 * Give a plugin function the signature it has once bound. Only a type: the
 * function is returned as it is.
 *
 * @example
 * const snap = boundAs<typeof snapBound>()(snapWith);
 *
 * @returns A function that marks its argument
 */
// oxlint-disable-next-line typescript/no-unnecessary-type-parameters -- Shape is the mark itself: it only appears in the result type
function boundAs<Shape>(): <Fn>(fn: Fn) => Fn & BoundAs<Shape> {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The mark is a type only; the function is unchanged
  return (fn) => fn as typeof fn & BoundAs<Shape>;
}

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
 * import { calendar } from "@aleksejdix/minuta/calendar";
 * const grids = bind(temporalUnits({ weekStartsOn: "sunday" }), calendar);
 * grids.monthGrid(Temporal.Now.plainDateISO());
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

export { bind, boundAs };
export type { Bound, BoundAs, BoundPlugin, Plugin, WithUnits };
