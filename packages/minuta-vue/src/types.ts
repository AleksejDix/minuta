import type { Adapter, AdapterUnit, Period, Unit } from "minuta";
import type { ComputedRef, Ref } from "vue";

/**
 * Vue-specific temporal instance with reactive state.
 * Browsing and now periods remain fully reactive while core adapter logic
 * comes from minuta.
 */
export interface VueTemporal {
  adapter: Adapter;
  weekStartsOn: number;
  locale: string;
  browsing: Ref<Period>;
  now: Ref<Period> | ComputedRef<Period>;
}

/**
 * Options for creating a Vue temporal instance.
 * Callers must manage reactivity by passing refs for date/now.
 */
export interface CreateTemporalOptions {
  date: Ref<Date>;
  now?: Ref<Date>;
  adapter: Adapter;
  weekStartsOn?: number;
  locale?: string;
}

export interface TemporalBuilder extends VueTemporal {
  derivePeriod(date: Date, unit: AdapterUnit): Period;
  createPeriod(start: Date, end: Date): Period;
  divide(period: Period, unit: AdapterUnit): Period[];
  merge(periods: Period[], targetUnit?: AdapterUnit): Period;
  next(period: Period, count?: number): Period;
  previous(period: Period, count?: number): Period;
  go(period: Period, count: number): Period;
  split(period: Period, date: Date): [Period, Period];
  contains(period: Period, dateOrPeriod: Date | Period): boolean;
  isSame(
    period1: Period,
    period2: Period,
    unit: AdapterUnit | "custom"
  ): boolean;
}

export type { Adapter, AdapterUnit, Period, Unit, Duration } from "minuta";
