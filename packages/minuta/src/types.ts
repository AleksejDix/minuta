/**
 * The primitive — every time range is this.
 *
 * Created by derivePeriod(adapter, date, "month") for adapter units,
 * or createPeriod(start, end) for custom ranges.
 *
 * All operations work on Period.
 */
export type Period = {
  start: Date;
  end: Date;
  type: AdapterUnit | "custom";
};

/**
 * A container of periods with optional metadata.
 *
 * Stable grids (StableMonth, StableYear, StableDay) join this
 * with grid-specific metadata.
 */
export type Series = {
  periods: Period[];
};

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
export type Unit = AdapterUnit | "custom";

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
export type Duration = {
  years?: number;
  months?: number;
  weeks?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
};

export type AdapterOptions = {
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
};

/**
 * Adapter — 4 operations for date manipulation.
 *
 * Implementers must ensure:
 * - startOf returns the earliest millisecond of the unit (e.g., midnight for "day")
 * - endOf returns the latest millisecond of the unit (e.g., 23:59:59.999 for "day")
 * - add(date, N, unit) followed by add(result, -N, unit) returns the original date
 * - diff(a, b, unit) returns the number of complete units between a and b
 * - All methods preserve millisecond precision
 */
export type Adapter = {
  startOf(date: Date, unit: AdapterUnit): Date;
  endOf(date: Date, unit: AdapterUnit): Date;
  add(date: Date, amount: number, unit: AdapterUnit): Date;
  diff(from: Date, to: Date, unit: AdapterUnit): number;
};

/**
 * Unit handler for functional adapters.
 * Each unit has its own implementation.
 */
export type UnitHandler = {
  startOf(date: Date): Date;
  endOf(date: Date): Date;
  add(date: Date, amount: number): Date;
  diff(from: Date, to: Date): number;
};
