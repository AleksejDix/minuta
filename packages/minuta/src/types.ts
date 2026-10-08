/**
 * The primitive — every time range is this.
 *
 * Created by derivePeriod(adapter, date, "month") for adapter units,
 * or createPeriod(start, end) for custom ranges.
 *
 * All operations work on Period.
 */
type Period = {
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
type Series = {
  periods: Period[];
};

// ── Units ──

/**
 * Registry for unit types — keep as interface for module augmentation.
 */
// oxlint-disable-next-line typescript/consistent-type-definitions -- Module augmentation requires an interface
interface UnitRegistry {
  year: true;
  quarter: true;
  month: true;
  week: true;
  day: true;
  hour: true;
  minute: true;
  second: true;
}

type AdapterUnit = keyof UnitRegistry;

// ── Adapter ──

/**
 * 4 operations for date manipulation.
 *
 * - startOf: earliest millisecond of the unit (e.g., midnight for "day")
 * - endOf: latest millisecond of the unit (e.g., 23:59:59.999 for "day")
 * - add(date, N, unit) followed by add(result, -N, unit) returns the original date
 * - diff(a, b, unit) returns the number of complete units between a and b
 */
type Adapter = {
  readonly startOf: (date: Readonly<Date>, unit: AdapterUnit) => Date;
  readonly endOf: (date: Readonly<Date>, unit: AdapterUnit) => Date;
  readonly add: (
    date: Readonly<Date>,
    amount: number,
    unit: AdapterUnit
  ) => Date;
  readonly diff: (
    from: Readonly<Date>,
    to: Readonly<Date>,
    unit: AdapterUnit
  ) => number;
};

/**
 * Per-unit handler — internal to adapter implementations.
 */
type UnitHandler = {
  readonly startOf: (date: Readonly<Date>) => Date;
  readonly endOf: (date: Readonly<Date>) => Date;
  readonly add: (date: Readonly<Date>, amount: number) => Date;
  readonly diff: (from: Readonly<Date>, to: Readonly<Date>) => number;
};

/**
 * Deeply readonly view of a Period, accepted by functions that never mutate
 * their input. Every Period is assignable to it.
 */
type ReadonlyPeriod = Readonly<{
  end: Readonly<Date>;
  start: Readonly<Date>;
  type: Period["type"];
}>;

export type {
  Adapter,
  AdapterUnit,
  Period,
  ReadonlyPeriod,
  Series,
  UnitHandler,
  UnitRegistry,
};
