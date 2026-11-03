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
export { bind, boundAs } from "#src/bind";
export { MinutaError, specFor } from "#src/units";
export type { MinutaErrorCode } from "#src/units";
export { withUnits } from "#src/with-units";
export type { Bound, BoundAs, BoundPlugin, Plugin, WithUnits } from "#src/bind";
export type { Chunks, DivideOptions } from "#src/operations/divide";
export type { Minuta, WithUnitsOptions } from "#src/with-units";
export type { WeekOptions, Weekday, WeekdayNumber } from "#src/weekday";
export type {
  AllUnits,
  BuiltInUnit,
  DatePeriod,
  DateSpec,
  DateUnit,
  Period,
  PeriodOf,
  PlainDate,
  Settings,
  SpecOf,
  TimePeriod,
  TimeSpec,
  TimeUnit,
  TimeValue,
  Unit,
  UnitRegistry,
  Units,
  ZonedDateTime,
} from "#src/types";
