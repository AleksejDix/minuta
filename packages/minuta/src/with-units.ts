/**
 * `withUnits`: every function bound to one set of unit specs, like
 * ibanita's `withCountries`. The main entry is `withUnits(createUnits())`;
 * a test checks the two against each other, so they cannot drift apart.
 */

import type { Chunks, DivideOptions } from "#src/operations/divide";
import type {
  DateUnit,
  Period,
  PeriodOf,
  PlainDate,
  TimeValue,
  Unit,
  Units,
  ZonedDateTime,
} from "#src/types";
import type { DayGrid, MonthGrid, YearGrid } from "#src/calendar/index";
import {
  clamp,
  compare,
  contains,
  countWith,
  divideWith,
  equals,
  gap,
  isWeekdayWith,
  isWeekendWith,
  mergeWith,
  nextWith,
  overlaps,
  periodWith,
  previousWith,
  roundWith,
  sameWith,
  shiftWith,
  period as span,
} from "#src/operations/index";
import { dayGridWith, monthGridWith, yearGridWith } from "#src/calendar/index";
import type { RoundTo } from "#src/operations/round-options";
import { toLocaleString } from "#src/format/format";
import { unitNames } from "#src/units";

/** `round`: a date to date units, a moment to any unit. */
type Round = {
  (value: PlainDate, roundTo: RoundTo<DateUnit>): PlainDate;
  (value: ZonedDateTime, roundTo: RoundTo): ZonedDateTime;
};

/**
 * One member per unit: `month(value)` is the month that contains `value`.
 * Units added to `UnitRegistry` get theirs, as long as their name is not
 * one of the functions'. For a unit in a variable: `time[unit](value)`.
 */
type UnitPeriods = {
  readonly [Name in Unit]: (value: TimeValue) => PeriodOf<Name>;
};

/**
 * Every function, bound to one set of units. Written out rather than
 * derived, so the generic signatures keep their type parameters: a day's
 * `period` is a `DatePeriod`, `next` of a `TimePeriod` a `TimePeriod`.
 */
type Functions = Readonly<{
  clamp: typeof clamp;
  compare: typeof compare;
  contains: typeof contains;
  count: (period: Period, unit: Unit) => number;
  dayGrid: (value: TimeValue) => DayGrid;
  divide: <Source extends Period, Name extends Unit>(
    period: Source,
    unit: Name,
    options?: DivideOptions
  ) => Chunks<Source, Name>;
  equals: typeof equals;
  gap: typeof gap;
  isWeekday: (period: Period) => boolean;
  isWeekend: (period: Period) => boolean;
  merge: <Source extends Period>(
    periods: readonly Source[],
    unit?: Unit
  ) => Source | undefined;
  monthGrid: (value: TimeValue) => MonthGrid;
  next: <Source extends Period>(period: Source) => Source;
  overlaps: typeof overlaps;
  period: typeof span;
  previous: <Source extends Period>(period: Source) => Source;
  round: Round;
  same: (first: Period, second: Period, unit: Unit) => boolean;
  shift: <Source extends Period>(period: Source, steps: number) => Source;
  toLocaleString: typeof toLocaleString;
  /** The units every member is bound to */
  units: Units;
  yearGrid: (value: TimeValue) => YearGrid;
}>;

/** Every function and a member per unit, bound to one set of units. */
type Minuta = UnitPeriods & Functions;

// A member per unit the units have a spec for, built-in or your own
function unitPeriods(units: Units): UnitPeriods {
  const members = unitNames(units).map((name) => [
    name,
    (value: TimeValue): Period =>
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- A name with a spec in the units is one of its units
      periodWith(units, value, name as Unit),
  ]);
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- One member per spec in the units, each for its own unit
  return Object.fromEntries(members) as UnitPeriods;
}

/**
 * Bind every function to `units`: the same names as the main entry, with
 * your week start, weekend, time zone, calendar or locale.
 *
 * @example
 * import { createUnits, withUnits } from "@aleksejdix/minuta";
 *
 * const time = withUnits(createUnits({ locale: "he-IL", calendar: "hebrew" }));
 * time.month(Temporal.Now.plainDateISO()); // this Hebrew month
 * time.monthGrid(Temporal.Now.plainDateISO()); // its Sunday-first weeks
 * time.units; // the units passed in
 *
 * @param units - Unit specs to bind
 * @returns Every function, without the `units` parameter
 */
function withUnits(units: Units): Minuta {
  function round(value: PlainDate, roundTo: RoundTo<DateUnit>): PlainDate;
  function round(value: ZonedDateTime, roundTo: RoundTo): ZonedDateTime;
  /**
   * `roundWith` bound to the units.
   *
   * @param value - The date or moment to round
   * @param roundTo - The unit, or `smallestUnit` with its options
   * @returns The boundary, of the value's kind
   */
  function round(
    value: PlainDate | ZonedDateTime,
    roundTo: RoundTo
  ): PlainDate | ZonedDateTime {
    return roundWith(units, value, roundTo);
  }
  const functions: Functions = {
    clamp,
    compare,
    contains,
    count: (period, unit) => countWith(units, period, unit),
    dayGrid: (value) => dayGridWith(units, value),
    divide: (period, unit, options) => divideWith(units, period, unit, options),
    equals,
    gap,
    isWeekday: (period) => isWeekdayWith(units, period),
    isWeekend: (period) => isWeekendWith(units, period),
    merge: (periods, unit) => mergeWith(units, periods, unit),
    monthGrid: (value) => monthGridWith(units, value),
    next: (period) => nextWith(units, period),
    overlaps,
    period: span,
    previous: (period) => previousWith(units, period),
    round,
    same: (first, second, unit) => sameWith(units, first, second, unit),
    shift: (period, steps) => shiftWith(units, period, steps),
    toLocaleString,
    units,
    yearGrid: (value) => yearGridWith(units, value),
  };
  return Object.assign(unitPeriods(units), functions);
}

export { withUnits };
export type { Minuta, Round };
