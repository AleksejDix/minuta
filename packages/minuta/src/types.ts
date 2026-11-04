import type { Temporal } from "@js-temporal/polyfill";
import type { WeekdayNumber } from "#src/weekday";

// ── Values ──

/** A calendar date, read-only. */
type PlainDate = Readonly<Temporal.PlainDate>;

/** A moment in a time zone, read-only. */
type ZonedDateTime = Readonly<Temporal.ZonedDateTime>;

// ── Units ──

/**
 * Registry of unit names and their kind: `"date"` units (a year … a day)
 * are made of calendar dates, `"time"` units (an hour … a second) of
 * moments in a time zone. An interface so your code can add units through
 * module augmentation; the matching spec is passed as data in `Units`.
 */
// oxlint-disable-next-line typescript/consistent-type-definitions -- Module augmentation requires an interface
interface UnitRegistry {
  year: "date";
  quarter: "date";
  month: "date";
  week: "date";
  day: "date";
  hour: "time";
  minute: "time";
  second: "time";
}

/**
 * A unit name: `"year"`, `"quarter"`, `"month"`, `"week"`, `"day"`, `"hour"`,
 * `"minute"` or `"second"`, plus any unit added to `UnitRegistry`.
 */
type Unit = keyof UnitRegistry;

/** The units made of calendar dates: `"year"` … `"day"`, and your own. */
type DateUnit = {
  [Name in Unit]: UnitRegistry[Name] extends "date" ? Name : never;
}[Unit];

/** The units made of moments: `"hour"`, `"minute"`, `"second"`, and your own. */
type TimeUnit = {
  [Name in Unit]: UnitRegistry[Name] extends "time" ? Name : never;
}[Unit];

/**
 * The units every set of units provides. Units added to `UnitRegistry` come
 * with your own spec, so they are not part of `AllUnits`.
 */
type BuiltInUnit =
  | "day"
  | "hour"
  | "minute"
  | "month"
  | "quarter"
  | "second"
  | "week"
  | "year";

// ── Periods ──

/**
 * A span of calendar dates, `start` included and `end` excluded: March 2026
 * is `[2026-03-01, 2026-04-01)`. No time zone: a day is a date, so clock
 * changes cannot move it.
 */
type DatePeriod = Readonly<{
  end: PlainDate;
  start: PlainDate;
  unit: DateUnit | "custom";
}>;

/**
 * A span of moments in one time zone, `start` included and `end` excluded:
 * the hour from 13:00 is `[13:00, 14:00)`.
 */
type TimePeriod = Readonly<{
  end: ZonedDateTime;
  start: ZonedDateTime;
  unit: TimeUnit | "custom";
}>;

/**
 * The primitive: every time range is a Period. Plain, deeply readonly data,
 * `start` included and `end` excluded.
 *
 * `periodWith(units, value, "month")` creates one aligned to a unit,
 * `range(start, end)` a custom one.
 */
type Period = DatePeriod | TimePeriod;

/** The period a unit makes: a `DatePeriod` for date units, else a `TimePeriod`. */
type PeriodOf<Name extends Unit> = Name extends DateUnit
  ? DatePeriod
  : TimePeriod;

/**
 * A value a period can be made from. Date units read its calendar date;
 * time units its moment, in the units' time zone unless it carries its own.
 */
type TimeValue =
  | Readonly<Temporal.Instant>
  | PlainDate
  | Readonly<Temporal.PlainDateTime>
  | ZonedDateTime;

// ── Specs ──

/**
 * How one date unit behaves on calendar dates — plain data.
 *
 * - startOf: the first date of the unit containing `date`
 * - add(date, n): the date `n` units later (negative: earlier)
 * - diff(from, to): the number of complete units from `from` to `to`,
 *   truncated toward zero: the largest `n` with `add(from, n) <= to` (for
 *   an earlier `to`, the smallest `n` with `add(from, n) >= to`)
 */
type DateSpec = Readonly<{
  /** Marks a spec of calendar dates */
  kind: "date";
  add: (date: PlainDate, amount: number) => PlainDate;
  diff: (from: PlainDate, to: PlainDate) => number;
  startOf: (date: PlainDate) => PlainDate;
}>;

/**
 * How one time unit behaves on moments, with the same contract as
 * `DateSpec`. Results stay in the zone of the value passed in.
 */
type TimeSpec = Readonly<{
  /** Marks a spec of moments */
  kind: "time";
  add: (date: ZonedDateTime, amount: number) => ZonedDateTime;
  diff: (from: ZonedDateTime, to: ZonedDateTime) => number;
  startOf: (date: ZonedDateTime) => ZonedDateTime;
}>;

/** The spec of a unit: a `DateSpec` for date units, else a `TimeSpec`. */
type SpecOf<Name extends Unit> = Name extends DateUnit ? DateSpec : TimeSpec;

/**
 * Settings that travel with the unit specs.
 */
type Settings = Readonly<{
  /**
   * IANA time zone that dates become moments in, e.g. when a day is divided
   * into hours. Default: the runtime's.
   */
  timeZone?: string | undefined;
  /** First day of the `week` spec, 0 = Sunday … 6 = Saturday. Default: Monday. */
  weekStartsOn?: WeekdayNumber | undefined;
  /** Weekend days, 0 = Sunday … 6 = Saturday. Default: Saturday and Sunday. */
  weekend?: readonly WeekdayNumber[] | undefined;
}>;

/**
 * The unit specs available to unit-aware functions. Partial, so a bundle can
 * carry only the units it uses; `createUnits()` returns all, plus the
 * settings.
 */
type Units = Readonly<{ [Name in Unit]?: SpecOf<Name> }> & Settings;

/**
 * A spec for every built-in unit, as `createUnits()` returns. Add specs of
 * your own units next to them: `Object.assign({ fortnight }, createUnits())`.
 */
type AllUnits = Readonly<{ [Name in BuiltInUnit]: SpecOf<Name> }> &
  Readonly<{ timeZone: string }> &
  Settings;

export type {
  AllUnits,
  PlainDate,
  ZonedDateTime,
  BuiltInUnit,
  DatePeriod,
  DateSpec,
  DateUnit,
  Period,
  PeriodOf,
  Settings,
  SpecOf,
  TimePeriod,
  TimeSpec,
  TimeUnit,
  TimeValue,
  Unit,
  UnitRegistry,
  Units,
};
