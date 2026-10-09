/**
 * The pure core: rules without bound data, like ibanita's `core` entry.
 *
 * Unit-aware functions take the unit specs first (`nextWith(units, period)`);
 * unit-free functions take none. `withUnits` binds them all, `bind` binds a
 * plugin.
 *
 * @module minuta/core
 */
export {
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
export { bind } from "#src/bind";
export { MinutaError, specFor } from "#src/units";
export type { MinutaErrorCode } from "#src/units";
export { withUnits } from "#src/with-units";
export type { Bound, BoundPlugin, Plugin, WithUnits } from "#src/bind";
export type { DivideOptions } from "#src/operations/index";
export type { Minuta, WithUnitsOptions } from "#src/with-units";
export type { WeekOptions, Weekday, WeekdayNumber } from "#src/weekday";
export type {
  AllUnits,
  BuiltInUnit,
  Period,
  Unit,
  UnitRegistry,
  Units,
  UnitSpec,
} from "#src/types";
