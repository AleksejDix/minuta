/**
 * Divide time into pieces. Every function, ready to use: `withUnits(createUnits())`,
 * the Temporal units with weeks starting on Monday (ISO 8601), the runtime's
 * time zone and each date's own calendar. Where the runtime has no Temporal,
 * `await temporalReady()` from `@aleksejdix/minuta/temporal` first.
 *
 * For another week start, weekend, time zone, calendar or locale, bind every
 * function at once with `withUnits(createUnits({ … }))`: the same names.
 *
 * @module minuta
 */
import type { Chunks, DivideOptions } from "#src/operations/divide";
import type {
  DateUnit,
  Period,
  PlainDate,
  Unit,
  ZonedDateTime,
} from "#src/types";
import {
  countWith,
  divideWith,
  mergeWith,
  nextWith,
  previousWith,
  roundWith,
  shiftWith,
} from "#src/operations/index";
import type { RoundTo } from "#src/operations/round-options";
import { units } from "#src/default-units";

/**
 * Split a period into chunks of `unit`, clipped to the period. Weeks start
 * on Monday.
 *
 * @example
 * divide(month(Temporal.PlainDate.from("2026-03-01")), "day"); // 31 day periods
 * divide(hour(Temporal.Now.zonedDateTimeISO()), "minute", { step: 15 }); // 4 periods
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
 * How many complete `unit`s fit into a period, calendar- and DST-aware: a
 * number, where `start.until(end)` gives a `Temporal.Duration`.
 *
 * @example
 * count(day(Temporal.PlainDate.from("2026-10-08")), "hour"); // 24
 * count(month(Temporal.PlainDate.from("2026-02-01")), "day"); // 28
 *
 * @param source - The period to measure
 * @param unit - The unit to count
 * @returns The number of complete units
 */
function count(source: Period, unit: Unit): number {
  return countWith(units, source, unit);
}

/**
 * Merge periods of one kind into one spanning the earliest start to the
 * latest end. The result keeps `unit` (by default the first period's unit)
 * only when it is exactly one period of that unit; otherwise its unit is
 * `"custom"`.
 *
 * @example
 * merge([januaryFirstHalf, januarySecondHalf], "month"); // January, unit "month"
 * merge([january, march]); // Jan 1 – Apr 1, unit "custom"
 * merge([]); // undefined
 *
 * @param periods - The periods to merge, all dates or all moments
 * @param unit - The unit the merged period should have if it is aligned
 * @returns The merged period, or undefined for an empty list
 */
function merge<Source extends Period>(
  periods: readonly Source[],
  unit?: Unit
): Source | undefined {
  return mergeWith(units, periods, unit);
}

/**
 * The next period of the same unit. Weeks start on Monday.
 *
 * @example
 * next(month(Temporal.PlainDate.from("2026-03-15"))); // April 2026
 *
 * @param source - Current period
 * @returns The following period of the same unit
 */
function next<Source extends Period>(source: Source): Source {
  return nextWith(units, source);
}

/**
 * The previous period of the same unit. Weeks start on Monday.
 *
 * @example
 * previous(month(Temporal.PlainDate.from("2026-03-15"))); // February 2026
 *
 * @param source - Current period
 * @returns The preceding period of the same unit
 */
function previous<Source extends Period>(source: Source): Source {
  return previousWith(units, source);
}

function round(value: PlainDate, roundTo: RoundTo<DateUnit>): PlainDate;
function round(value: ZonedDateTime, roundTo: RoundTo): ZonedDateTime;
/**
 * Round a date or a moment to a unit's boundary, like Temporal's `round()`
 * with the same options, extended to weeks, months, quarters and years.
 * With `roundingIncrement`, boundaries count from the start of the
 * enclosing unit (minutes from the hour, days from the month); weeks and
 * years from 1970.
 *
 * @example
 * round(Temporal.ZonedDateTime.from("2026-03-15T10:37[Europe/Zurich]"), { smallestUnit: "minute", roundingIncrement: 15 }); // 10:30
 * round(Temporal.ZonedDateTime.from("2026-03-15T10:37[Europe/Zurich]"), { smallestUnit: "day", roundingMode: "ceil" }); // Mar 16 00:00
 * round(Temporal.PlainDate.from("2026-03-18"), { smallestUnit: "week", roundingMode: "floor" }); // Monday 2026-03-16
 * round(Temporal.PlainDate.from("2026-03-18"), "month"); // 2026-04-01 (halfExpand)
 *
 * @param value - The date or moment to round
 * @param roundTo - The unit, or `smallestUnit` with `roundingIncrement`
 *   (default 1) and `roundingMode` (default `"halfExpand"`)
 * @returns The boundary, of the value's kind; `value` itself when it is one
 * @throws {TypeError} For a date and a time unit: dates round to date units
 */
function round(
  value: PlainDate | ZonedDateTime,
  roundTo: RoundTo
): PlainDate | ZonedDateTime {
  return roundWith(units, value, roundTo);
}

/**
 * Move a period by `steps` of its own unit; negative moves back.
 *
 * @example
 * shift(month(Temporal.PlainDate.from("2026-03-15")), 3); // June 2026
 *
 * @param source - Period to move
 * @param steps - How many periods to move
 * @returns The moved period
 */
function shift<Source extends Period>(source: Source, steps: number): Source {
  return shiftWith(units, source, steps);
}

export { count, divide, merge, next, previous, round, shift };
export {
  day,
  hour,
  minute,
  month,
  quarter,
  second,
  week,
  year,
} from "#src/default-periods";
export {
  dayGrid,
  isWeekday,
  isWeekend,
  monthGrid,
  yearGrid,
} from "#src/default-calendar";
export {
  clamp,
  compare,
  contains,
  equals,
  gap,
  overlaps,
  period,
} from "#src/operations/index";
export { toLocaleString } from "#src/format/format";
export { createUnits } from "#src/create-units";
export type { UnitsOptions } from "#src/create-units";
export { MinutaError } from "#src/units";
export type { MinutaErrorCode } from "#src/units";
export { withUnits } from "#src/with-units";
export type { Minuta, Round } from "#src/with-units";
export type { Chunks, DivideOptions } from "#src/operations/divide";
export type {
  RoundOptions,
  RoundTo,
  RoundingMode,
} from "#src/operations/index";
export type { WeekOptions, Weekday, WeekdayNumber } from "#src/weekday";
export type {
  DayGrid,
  HourSlot,
  MonthGrid,
  YearGrid,
} from "#src/calendar/index";
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
