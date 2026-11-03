/**
 * Divide time into pieces. Every operation, ready to use: bound to the
 * Temporal units with weeks starting on Monday (ISO 8601). Where the runtime
 * has no Temporal, `await temporalReady()` from `@aleksejdix/minuta/temporal`
 * first.
 *
 * For other week starts or a smaller bundle, use `withUnits` from
 * `@aleksejdix/minuta/core`.
 *
 * @module minuta
 */
import type { Chunks, DivideOptions } from "#src/operations/divide";
import type { Period, PeriodOf, TimeValue, Unit } from "#src/types";
import {
  divideWith,
  durationWith,
  nextWith,
  periodWith,
  previousWith,
  sameWith,
  shiftWith,
} from "#src/operations/index";
import { temporalUnits } from "#src/adapters/temporal/index";

/*
 * Each function binds the units on its own, so bundlers drop the unused
 * ones. A test assigns them to `Minuta`, so this entry and `withUnits`
 * cannot drift apart.
 */
// oxlint-disable-next-line eslint/no-inline-comments -- The pure marker lets bundlers drop the units when no bound function is used
const units = /* @__PURE__ */ temporalUnits();

/**
 * Split a period into chunks of `unit`, clipped to the period. Temporal units,
 * weeks start on Monday; `divideWith` in `minuta/core` takes your own units.
 *
 * @example
 * divide(period(Temporal.PlainDate.from("2026-03-01"), "month"), "day"); // 31 day periods
 * divide(period(Temporal.Now.zonedDateTimeISO(), "hour"), "minute", { step: 15 }); // 4 periods
 *
 * @param source - Period to divide
 * @param unit - Unit of the chunks
 * @param options - `step` (units per chunk) and `maxPeriods` (safety limit)
 * @returns The chunks, clipped to the period
 */
function divide<Source extends Period, Name extends Unit>(
  source: Source,
  unit: Name,
  options?: DivideOptions
): Chunks<Source, Name> {
  return divideWith(units, source, unit, options);
}

/**
 * How many complete `unit`s fit into a period. Temporal units, calendar- and
 * DST-aware; `durationWith` in `minuta/core` takes your own units.
 *
 * @example
 * duration(period(Temporal.PlainDate.from("2026-10-08"), "day"), "hour"); // 24
 * duration(period(Temporal.PlainDate.from("2026-02-01"), "month"), "day"); // 28
 *
 * @param source - The period to measure
 * @param unit - The unit to count
 * @returns The number of complete units
 */
function duration(source: Period, unit: Unit): number {
  return durationWith(units, source, unit);
}

/**
 * The next period of the same unit. Temporal units, weeks start on Monday.
 *
 * @example
 * next(period(Temporal.PlainDate.from("2026-03-15"), "month")); // April 2026
 *
 * @param source - Current period
 * @returns The following period of the same unit
 */
function next<Source extends Period>(source: Source): Source {
  return nextWith(units, source);
}

/**
 * The period of `unit` that contains `value`. Temporal units, weeks start on
 * Monday, moments in the runtime's zone; `periodWith` in `minuta/core` takes
 * your own units.
 *
 * @example
 * period(Temporal.PlainDate.from("2026-03-15"), "month"); // { start: 2026-03-01, end: 2026-04-01, unit: "month" }
 * period(Temporal.PlainDate.from("2026-03-18"), "week"); // Monday Mar 16 up to Monday Mar 23
 *
 * @param value - Any value inside the period
 * @param unit - Unit of the period
 * @returns The period of `unit` containing `value`
 */
function period<Name extends Unit>(
  value: TimeValue,
  unit: Name
): PeriodOf<Name> {
  return periodWith(units, value, unit);
}

/**
 * The previous period of the same unit. Temporal units, weeks start on Monday.
 *
 * @example
 * previous(period(Temporal.PlainDate.from("2026-03-15"), "month")); // February 2026
 *
 * @param source - Current period
 * @returns The preceding period of the same unit
 */
function previous<Source extends Period>(source: Source): Source {
  return previousWith(units, source);
}

/**
 * Whether two periods fall into the same `unit`. Temporal units.
 *
 * @example
 * same(period(Temporal.PlainDate.from("2026-03-16"), "day"), period(Temporal.PlainDate.from("2026-03-20"), "day"), "week"); // true
 *
 * @param first - One period
 * @param second - The other period
 * @param unit - Granularity of the comparison
 * @returns Whether both periods are in the same unit
 */
function same(first: Period, second: Period, unit: Unit | "custom"): boolean {
  return sameWith(units, first, second, unit);
}

/**
 * Move a period by `steps` of its own unit; negative moves back. Temporal units.
 *
 * @example
 * shift(period(Temporal.PlainDate.from("2026-03-15"), "month"), 3); // June 2026
 *
 * @param source - Period to move
 * @param steps - How many periods to move
 * @returns The moved period
 */
function shift<Source extends Period>(source: Source, steps: number): Source {
  return shiftWith(units, source, steps);
}

export { divide, duration, next, period, previous, same, shift };
export { contains, length, overlaps, range } from "#src/operations/index";
export { MinutaError } from "#src/units";
export type { MinutaErrorCode } from "#src/units";
export type { Chunks, DivideOptions } from "#src/operations/divide";
export type { Minuta } from "#src/with-units";
export type {
  DatePeriod,
  DateUnit,
  Period,
  PeriodOf,
  PlainDate,
  TimePeriod,
  TimeUnit,
  TimeValue,
  Unit,
  Units,
  ZonedDateTime,
} from "#src/types";
export type { Weekday } from "#src/weekday";
