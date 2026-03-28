import type {
  Adapter,
  AdapterUnit,
  Period,
  Unit,
} from "@allystudio/usetemporal";

/**
 * Base React temporal instance with reactive state.
 * This is the internal state container, similar to VueTemporal.
 */
export interface ReactTemporal {
  adapter: Adapter;
  weekStartsOn: number;
  browsing: Period;
  now: Period;
}

/**
 * Temporal builder with convenience methods wrapping operations.
 * This is what useTemporal() returns to users.
 */
export interface TemporalBuilder extends ReactTemporal {
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

/**
 * Options for creating a React temporal instance.
 */
export interface UseTemporalOptions {
  adapter: Adapter;
  date?: Date;
  now?: Date;
  weekStartsOn?: number;
}

export type {
  Adapter,
  AdapterUnit,
  Period,
  Unit,
  Duration,
} from "@allystudio/usetemporal";
