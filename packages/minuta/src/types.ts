import type { WeekdayNumber } from "#src/weekday";

/**
 * The primitive: every time range is a Period. Plain, deeply readonly data.
 *
 * `periodWith(units, date, "month")` creates one aligned to a unit,
 * `range(start, end)` a custom one. `end` is inclusive (the last millisecond).
 */
type Period = Readonly<{
  end: Readonly<Date>;
  start: Readonly<Date>;
  unit: Unit | "custom";
}>;

/**
 * A container of periods. Calendar grids extend it with metadata.
 */
type Series = Readonly<{
  periods: readonly Period[];
}>;

// ── Units ──

/**
 * Registry of unit names. An interface so plugins can add units through
 * module augmentation; the matching spec is passed as data in `Units`.
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

/**
 * A unit name: `"year"`, `"quarter"`, `"month"`, `"week"`, `"day"`, `"hour"`,
 * `"minute"` or `"second"`, plus any unit added to `UnitRegistry`.
 */
type Unit = keyof UnitRegistry;

/**
 * How one unit behaves — plain data, like a country spec in ibanita.
 *
 * - startOf: earliest millisecond of the unit containing `date`
 * - endOf: latest millisecond of the unit containing `date`
 * - add(date, n) then add(result, -n) returns the original date
 * - diff(from, to) is the number of complete units between the dates
 */
type UnitSpec = Readonly<{
  add: (date: Readonly<Date>, amount: number) => Date;
  diff: (from: Readonly<Date>, to: Readonly<Date>) => number;
  endOf: (date: Readonly<Date>) => Date;
  startOf: (date: Readonly<Date>) => Date;
}>;

/**
 * Calendar settings that travel with the unit specs.
 */
type WeekSettings = Readonly<{
  /** Weekend days as `Date#getDay()` numbers. Default: Saturday and Sunday. */
  weekend?: readonly WeekdayNumber[] | undefined;
}>;

/**
 * The unit specs available to unit-aware functions. Partial, so a bundle can
 * carry only the units it uses; adapters such as `nativeUnits()` return all,
 * plus the `weekend`.
 */
type Units = Readonly<Partial<Record<Unit, UnitSpec>>> & WeekSettings;

/**
 * A spec for every unit, as returned by the adapters.
 */
type AllUnits = Readonly<Record<Unit, UnitSpec>> & WeekSettings;

export type { AllUnits, Period, Series, Unit, UnitRegistry, Units, UnitSpec };
