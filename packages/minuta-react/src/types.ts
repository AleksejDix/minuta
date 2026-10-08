import type { Adapter, AdapterUnit, Period, ReadonlyPeriod } from "minuta";

/**
 * Base React minuta instance with reactive state.
 * This is the internal state container, similar to VueMinuta.
 */
type ReactMinuta = {
  readonly adapter: Readonly<Adapter>;
  readonly weekStartsOn: number;
  readonly browsing: ReadonlyPeriod;
  readonly now: ReadonlyPeriod;
};

/**
 * Minuta builder with convenience methods wrapping operations.
 * This is what useMinuta() returns to users.
 */
type MinutaBuilder = ReactMinuta & {
  readonly derivePeriod: (date: Readonly<Date>, unit: AdapterUnit) => Period;
  readonly createPeriod: (start: Readonly<Date>, end: Readonly<Date>) => Period;
  readonly divide: (period: ReadonlyPeriod, unit: AdapterUnit) => Period[];
  readonly merge: (
    periods: readonly ReadonlyPeriod[],
    targetUnit?: AdapterUnit
  ) => Period;
  readonly next: (period: ReadonlyPeriod, count?: number) => Period;
  readonly previous: (period: ReadonlyPeriod, count?: number) => Period;
  readonly go: (period: ReadonlyPeriod, count: number) => Period;
  readonly split: (
    period: ReadonlyPeriod,
    date: Readonly<Date>
  ) => [Period, Period];
  readonly contains: (
    period: ReadonlyPeriod,
    dateOrPeriod: Readonly<Date> | ReadonlyPeriod
  ) => boolean;
  readonly isSame: (
    period1: ReadonlyPeriod,
    period2: ReadonlyPeriod,
    unit: AdapterUnit | "custom"
  ) => boolean;
};

/**
 * Options for creating a React minuta instance.
 */
type UseMinutaOptions = {
  readonly adapter: Readonly<Adapter>;
  readonly date?: Readonly<Date>;
  readonly now?: Readonly<Date>;
  readonly weekStartsOn?: number;
};

export type { MinutaBuilder, ReactMinuta, UseMinutaOptions };
export type { Adapter, AdapterUnit, Period } from "minuta";
