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
import type { AdapterUnit, Period } from "minuta";
import type { MinutaBuilder, VueMinuta } from "./types";

/**
 * Create a minuta builder with convenient method wrappers
 *
 * This wraps pure operations with automatic adapter passing.
 * Each method is tree-shakable - unused methods add 0KB to bundle.
 *
 * @param minuta - The base minuta instance
 * @returns A minuta builder with convenience methods
 *
 * @example
 * ```typescript
 * const minuta = createMinuta({ adapter: nativeAdapter, date: ref(new Date()) });
 * const builder = createMinutaBuilder(minuta);
 *
 * const year = builder.period(new Date(), 'year');
 * const months = builder.divide(year, 'month');
 * ```
 */
export function createMinutaBuilder(minuta: VueMinuta): MinutaBuilder {
  return {
    get adapter() {
      return minuta.adapter;
    },
    set adapter(value) {
      minuta.adapter = value;
    },
    get weekStartsOn() {
      return minuta.weekStartsOn;
    },
    set weekStartsOn(value) {
      minuta.weekStartsOn = value;
    },
    get browsing() {
      return minuta.browsing;
    },
    set browsing(value) {
      minuta.browsing = value;
    },
    get now() {
      return minuta.now;
    },
    set now(value) {
      minuta.now = value;
    },
    get locale() {
      return minuta.locale;
    },
    set locale(value: string) {
      minuta.locale = value;
    },

    derivePeriod(date: Date, unit: AdapterUnit): Period {
      return derivePeriod(minuta.adapter, date, unit);
    },

    createPeriod(start: Date, end: Date): Period {
      return createPeriod(start, end);
    },

    divide(period: Period, unit: AdapterUnit): Period[] {
      return divide(minuta.adapter, period, unit);
    },

    merge(periods: Period[], targetUnit?: AdapterUnit): Period {
      return merge(minuta.adapter, periods, targetUnit);
    },

    next(period: Period, count: number = 1): Period {
      const result =
        count === 1
          ? next(minuta.adapter, period)
          : go(minuta.adapter, period, count);
      minuta.browsing.value = result;
      return result;
    },

    previous(period: Period, count: number = 1): Period {
      const result =
        count === 1
          ? previous(minuta.adapter, period)
          : go(minuta.adapter, period, -count);
      minuta.browsing.value = result;
      return result;
    },

    go(period: Period, count: number): Period {
      const result = go(minuta.adapter, period, count);
      minuta.browsing.value = result;
      return result;
    },

    split(period: Period, date: Date): [Period, Period] {
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
      return isSame(minuta.adapter, period1, period2, unit);
    },
  };
}
