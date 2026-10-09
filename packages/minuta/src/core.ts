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
export { bind } from "#src/bind";
export { MinutaError, specFor } from "#src/units";
export type { MinutaErrorCode } from "#src/units";
export { withUnits } from "#src/with-units";
export type { Bound, BoundPlugin, Plugin, WithUnits } from "#src/bind";
export type {
  DivideOptions,
  SnapMode,
  SnapOptions,
} from "#src/operations/index";
export type { Minuta, WithUnitsOptions } from "#src/with-units";
export type {
  AllUnits,
  Period,
  Series,
  Unit,
  UnitRegistry,
  Units,
  UnitSpec,
} from "#src/types";
