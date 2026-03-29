import type { Adapter, AdapterUnit, Period, TimePeriod } from "minuta";
import type { Readable, Writable } from "svelte/store";

/**
 * Base Svelte minuta instance with reactive stores.
 */
export interface SvelteMinuta {
  adapter: Adapter;
  weekStartsOn: number;
  locale: string;
  browsing: Writable<Period>;
  now: Readable<Period>;
}

/**
 * Options for creating a Svelte minuta instance.
 */
export interface CreateMinutaOptions {
  adapter: Adapter;
  date?: Writable<Date>;
  now?: Readable<Date>;
  weekStartsOn?: number;
  locale?: string;
}

/**
 * Temporal builder users interact with.
 */
export interface MinutaBuilder extends SvelteMinuta {
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
