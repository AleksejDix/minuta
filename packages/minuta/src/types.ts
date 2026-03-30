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

// ── Units ──

/**
 * Registry for unit types — keep as interface for module augmentation.
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

export type AdapterUnit = keyof UnitRegistry;

// ── Adapter ──

/**
 * 4 operations for date manipulation.
 *
 * - startOf: earliest millisecond of the unit (e.g., midnight for "day")
 * - endOf: latest millisecond of the unit (e.g., 23:59:59.999 for "day")
 * - add(date, N, unit) followed by add(result, -N, unit) returns the original date
 * - diff(a, b, unit) returns the number of complete units between a and b
 */
export type Adapter = {
  startOf(date: Date, unit: AdapterUnit): Date;
  endOf(date: Date, unit: AdapterUnit): Date;
  add(date: Date, amount: number, unit: AdapterUnit): Date;
  diff(from: Date, to: Date, unit: AdapterUnit): number;
};

/**
 * Per-unit handler — internal to adapter implementations.
 */
export type UnitHandler = {
  startOf(date: Date): Date;
  endOf(date: Date): Date;
  add(date: Date, amount: number): Date;
  diff(from: Date, to: Date): number;
};
