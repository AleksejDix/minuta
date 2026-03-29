import type { Adapter, AdapterUnit, Period, TimePeriod } from "minuta";
import type { ComputedRef, Ref } from "vue";

/**
 * Vue-specific minuta instance with reactive state.
 * Browsing and now periods remain fully reactive while core adapter logic
 * comes from minuta.
 */
export interface VueMinuta {
  adapter: Adapter;
  weekStartsOn: number;
  locale: string;
  browsing: Ref<Period>;
  now: Ref<Period> | ComputedRef<Period>;
}

/**
 * Options for creating a Vue minuta instance.
 * Callers must manage reactivity by passing refs for date/now.
 */
export interface CreateMinutaOptions {
  date: Ref<Date>;
  now?: Ref<Date>;
  adapter: Adapter;
  weekStartsOn?: number;
  locale?: string;
}

export interface MinutaBuilder extends VueMinuta {
  derivePeriod(date: Date, unit: AdapterUnit): TimePeriod;
  createPeriod(start: Date, end: Date): TimePeriod;
  divide(period: Period, unit: AdapterUnit): TimePeriod[];
  merge(periods: TimePeriod[], targetUnit?: AdapterUnit): TimePeriod;
  next(period: TimePeriod, count?: number): TimePeriod;
  previous(period: TimePeriod, count?: number): TimePeriod;
  go(period: TimePeriod, count: number): TimePeriod;
  split(period: TimePeriod, date: Date): [TimePeriod, TimePeriod];
  contains(period: Period, dateOrPeriod: Date | Period): boolean;
  isSame(
    period1: Period,
    period2: Period,
    unit: AdapterUnit | "custom"
  ): boolean;
}

export type { Adapter, AdapterUnit, Period, Unit, Duration } from "minuta";
