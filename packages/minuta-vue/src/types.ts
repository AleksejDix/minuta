import type { Adapter, AdapterUnit, Period, ReadonlyPeriod } from "minuta";
import type { ComputedRef, Ref } from "vue";

/**
 * Vue-specific minuta instance with reactive state.
 * Browsing and now periods remain fully reactive while core adapter logic
 * comes from minuta.
 */
type VueMinuta = {
  adapter: Adapter;
  weekStartsOn: number;
  locale: string;
  browsing: Ref<Period>;
  now: Ref<Period> | ComputedRef<Period>;
};

/**
 * Options for creating a Vue minuta instance.
 * Callers must manage reactivity by passing refs for date/now.
 */
type CreateMinutaOptions = {
  date: Ref<Date>;
  now?: Ref<Date>;
  adapter: Adapter;
  weekStartsOn?: number;
  locale?: string;
};

type MinutaBuilder = VueMinuta & {
  derivePeriod: (date: Readonly<Date>, unit: AdapterUnit) => Period;
  createPeriod: (start: Readonly<Date>, end: Readonly<Date>) => Period;
  divide: (period: ReadonlyPeriod, unit: AdapterUnit) => Period[];
  merge: (
    periods: readonly ReadonlyPeriod[],
    targetUnit?: AdapterUnit
  ) => Period;
  next: (period: ReadonlyPeriod, count?: number) => Period;
  previous: (period: ReadonlyPeriod, count?: number) => Period;
  go: (period: ReadonlyPeriod, count: number) => Period;
  split: (period: ReadonlyPeriod, date: Readonly<Date>) => [Period, Period];
  contains: (
    period: ReadonlyPeriod,
    dateOrPeriod: Readonly<Date> | ReadonlyPeriod
  ) => boolean;
  isSame: (
    period1: ReadonlyPeriod,
    period2: ReadonlyPeriod,
    unit: AdapterUnit | "custom"
  ) => boolean;
};

export type { CreateMinutaOptions, MinutaBuilder, VueMinuta };
export type { Adapter, AdapterUnit, Period } from "minuta";
