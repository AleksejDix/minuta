import {
  derivePeriod,
  createPeriod,
  divide,
  merge,
  next,
  previous,
  go,
  split,
  contains,
  isSame,
} from "minuta/operations";
import type { AdapterUnit, Period, TimePeriod } from "minuta";
import type { MinutaBuilder, VueMinuta } from "./types";

/**
 * Create a minuta builder with convenient method wrappers
 *
 * This wraps pure operations with automatic adapter passing.
 * Each method is tree-shakable - unused methods add 0KB to bundle.
 *
 * @param temporal - The base minuta instance
 * @returns A minuta builder with convenience methods
 *
 * @example
 * ```typescript
 * const temporal = createMinuta({ adapter: nativeAdapter, date: ref(new Date()) });
 * const builder = createMinutaBuilder(temporal);
 *
 * const year = builder.period(new Date(), 'year');
 * const months = builder.divide(year, 'month');
 * ```
 */
export function createMinutaBuilder(temporal: VueMinuta): MinutaBuilder {
  return {
    get adapter() {
      return temporal.adapter;
    },
    set adapter(value) {
      temporal.adapter = value;
    },
    get weekStartsOn() {
      return temporal.weekStartsOn;
    },
    set weekStartsOn(value) {
      temporal.weekStartsOn = value;
    },
    get browsing() {
      return temporal.browsing;
    },
    set browsing(value) {
      temporal.browsing = value;
    },
    get now() {
      return temporal.now;
    },
    set now(value) {
      temporal.now = value;
    },
    get locale() {
      return temporal.locale;
    },
    set locale(value: string) {
      temporal.locale = value;
    },

    derivePeriod(date: Date, unit: AdapterUnit): TimePeriod {
      return derivePeriod(temporal.adapter, date, unit);
    },

    createPeriod(start: Date, end: Date): TimePeriod {
      return createPeriod(start, end);
    },

    divide(period: Period, unit: AdapterUnit): TimePeriod[] {
      return divide(temporal.adapter, period, unit);
    },

    merge(periods: TimePeriod[], targetUnit?: AdapterUnit): TimePeriod {
      return merge(temporal.adapter, periods, targetUnit);
    },

    next(period: TimePeriod, count: number = 1): TimePeriod {
      const result =
        count === 1
          ? next(temporal.adapter, period)
          : go(temporal.adapter, period, count);
      temporal.browsing.value = result;
      return result;
    },

    previous(period: TimePeriod, count: number = 1): TimePeriod {
      const result =
        count === 1
          ? previous(temporal.adapter, period)
          : go(temporal.adapter, period, -count);
      temporal.browsing.value = result;
      return result;
    },

    go(period: TimePeriod, count: number): TimePeriod {
      const result = go(temporal.adapter, period, count);
      temporal.browsing.value = result;
      return result;
    },

    split(period: TimePeriod, date: Date): [TimePeriod, TimePeriod] {
      return split(period, date);
    },

    contains(period: Period, dateOrPeriod: Date | Period): boolean {
      return contains(period, dateOrPeriod);
    },

    isSame(
      period1: Period,
      period2: Period,
      unit: AdapterUnit | "custom"
    ): boolean {
      return isSame(temporal.adapter, period1, period2, unit);
    },
  };
}
