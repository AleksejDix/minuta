/** Metadata for stableMonth periods */
export interface StableMonthMeta {
  weekStartsOn: number;
  monthStart: Date;
}

/** Metadata for stableYear periods */
export interface StableYearMeta {
  weekStartsOn: number;
  yearStart: Date;
}

/**
 * A single time range with a start and end.
 *
 * Created by derivePeriod(adapter, date, "month") for adapter units,
 * or createPeriod(start, end) for custom ranges.
 *
 * Used with: go(), next(), previous(), divide(), merge(), isSame()
 */
export interface TimePeriod {
  start: Date;
  end: Date;
  type: AdapterUnit | "custom";
}

/**
 * A predictable sequence container — a time range designed to be subdivided
 * into a fixed number of sub-periods for calendar grid layouts.
 *
 * Created by createStableMonth() (42-day / 6-week grid)
 * or createStableYear() (52-53 week grid).
 *
 * Use divide(adapter, series, "day") to get the grid cells.
 * Navigate by calling createStableMonth/Year directly with a new date.
 */
export type PeriodSeries =
  | { start: Date; end: Date; type: "stableMonth"; meta: StableMonthMeta }
  | { start: Date; end: Date; type: "stableYear"; meta: StableYearMeta };

/**
 * The union of TimePeriod and PeriodSeries.
 *
 * Operations like contains(), split(), isOverlapping() accept any Period.
 * Navigation operations (go, next, previous) accept only TimePeriod.
 * Check p.type to narrow: "stableMonth"/"stableYear" = PeriodSeries, anything else = TimePeriod.
 */
export type Period = TimePeriod | PeriodSeries;

/**
 * Registry for unit types - extend this interface to add custom units
 */
export interface UnitRegistry {
  year: true;
  quarter: true;
  month: true;
  week: true;
  day: true;
  hour: true;
  minute: true;
  second: true;
}

/**
 * Unified type for all time units
 * Extensible via module augmentation of UnitRegistry
 */
export type AdapterUnit = keyof UnitRegistry;
export type Unit = AdapterUnit | "custom" | "stableMonth" | "stableYear";

/**
 * All available time unit constants grouped for better autocomplete and imports.
 *
 * @example
 * import { UNITS } from 'minuta'
 *
 * // Better autocomplete
 * const months = divide(adapter, year, UNITS.month)
 * const days = divide(adapter, month, UNITS.day)
 */
export const UNITS = Object.freeze({
  year: "year",
  quarter: "quarter",
  month: "month",
  week: "week",
  day: "day",
  hour: "hour",
  minute: "minute",
  second: "second",
  custom: "custom",
} as const);

// Individual exports for convenience
export const YEAR = "year" as const;
export const QUARTER = "quarter" as const;
export const MONTH = "month" as const;
export const WEEK = "week" as const;
export const DAY = "day" as const;
export const HOUR = "hour" as const;
export const MINUTE = "minute" as const;
export const SECOND = "second" as const;
export const CUSTOM = "custom" as const;

/**
 * Type definition for the UNITS object
 */
export type UnitsObject = typeof UNITS;

// Adapter Types
export interface Duration {
  years?: number;
  months?: number;
  weeks?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
}

export interface AdapterOptions {
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
}

/**
 * Adapter interface — 4 operations for date manipulation.
 *
 * Implementers must ensure:
 * - startOf returns the earliest millisecond of the unit (e.g., midnight for "day")
 * - endOf returns the latest millisecond of the unit (e.g., 23:59:59.999 for "day")
 * - add(date, N, unit) followed by add(result, -N, unit) returns the original date
 * - diff(a, b, unit) returns the number of complete units between a and b
 * - All methods preserve millisecond precision
 */
export interface Adapter {
  /** Return the earliest moment of the unit containing date */
  startOf(date: Date, unit: AdapterUnit): Date;
  /** Return the latest moment (23:59:59.999) of the unit containing date */
  endOf(date: Date, unit: AdapterUnit): Date;
  /** Move date forward or backward by amount units */
  add(date: Date, amount: number, unit: AdapterUnit): Date;
  /** Count complete units between from and to */
  diff(from: Date, to: Date, unit: AdapterUnit): number;
}

/**
 * Unit handler for functional adapters
 * Each unit has its own implementation
 */
export interface UnitHandler {
  startOf(date: Date): Date;
  endOf(date: Date): Date;
  add(date: Date, amount: number): Date;
  diff(from: Date, to: Date): number;
}
