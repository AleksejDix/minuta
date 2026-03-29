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
import type { MinutaBuilder, SvelteMinuta } from "./types";

/**
 * Create a minuta builder with convenient method wrappers.
 */
export function createMinutaBuilder(minuta: SvelteMinuta): MinutaBuilder {
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
    set weekStartsOn(value: number) {
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

    derivePeriod(date: Date, unit: AdapterUnit): TimePeriod {
      return derivePeriod(minuta.adapter, date, unit);
    },

    createPeriod(start: Date, end: Date): TimePeriod {
      return createPeriod(start, end);
    },

    divide(period: TimePeriod, unit: AdapterUnit): TimePeriod[] {
      return divide(minuta.adapter, period, unit);
    },

    merge(periods: TimePeriod[], targetUnit?: AdapterUnit): TimePeriod {
      return merge(minuta.adapter, periods, targetUnit);
    },

    next(period: TimePeriod, count: number = 1): TimePeriod {
      const result =
        count === 1
          ? next(minuta.adapter, period)
          : go(minuta.adapter, period, count);

      minuta.browsing.set(result);
      return result;
    },

    previous(period: TimePeriod, count: number = 1): TimePeriod {
      const result =
        count === 1
          ? previous(minuta.adapter, period)
          : go(minuta.adapter, period, -count);

      minuta.browsing.set(result);
      return result;
    },

    go(period: TimePeriod, count: number): TimePeriod {
      const result = go(minuta.adapter, period, count);
      minuta.browsing.set(result);
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
      return isSame(minuta.adapter, period1, period2, unit);
    },
  };
}
