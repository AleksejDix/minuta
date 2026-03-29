import type { Adapter, AdapterUnit, Period, TimePeriod } from "minuta";

/**
 * Base React minuta instance with reactive state.
 * This is the internal state container, similar to VueMinuta.
 */
export interface ReactMinuta {
  adapter: Adapter;
  weekStartsOn: number;
  browsing: Period;
  now: Period;
}

/**
 * Minuta builder with convenience methods wrapping operations.
 * This is what useMinuta() returns to users.
 */
export interface MinutaBuilder extends ReactMinuta {
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

/**
 * Options for creating a React minuta instance.
 */
export interface UseMinutaOptions {
  adapter: Adapter;
  date?: Date;
  now?: Date;
  weekStartsOn?: number;
}

export type { Adapter, AdapterUnit, Period, Unit, Duration } from "minuta";
