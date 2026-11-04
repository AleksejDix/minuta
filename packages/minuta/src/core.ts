/**
 * The pure core: rules without bound data, like ibanita's `core` entry.
 *
 * Unit-aware functions take the unit specs first (`nextWith(units, period)`);
 * unit-free functions take none. `withUnits` binds them all.
 *
 * @module minuta/core
 */
export {
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
export { createUnits } from "#src/create-units";
export type { UnitsOptions } from "#src/create-units";
export { MinutaError, specFor } from "#src/units";
export type { MinutaErrorCode } from "#src/units";
export { withUnits } from "#src/with-units";
export type { Chunks, DivideOptions } from "#src/operations/divide";
export type { Minuta } from "#src/with-units";
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
