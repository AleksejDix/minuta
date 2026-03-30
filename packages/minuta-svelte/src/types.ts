import type { Adapter, AdapterUnit, Period } from "minuta";
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
 * Minuta builder users interact with.
 */
export interface MinutaBuilder extends SvelteMinuta {
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
