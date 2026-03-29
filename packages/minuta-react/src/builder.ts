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
import type { MinutaBuilder, ReactMinuta } from "./types";

/**
 * Create a minuta builder with convenient method wrappers
 *
 * This wraps pure operations with automatic adapter passing.
 * Each method is tree-shakable - unused methods add 0KB to bundle.
 *
 * @param temporal - The base minuta instance
 * @param setBrowsingDate - React state setter for browsing date
 * @returns A minuta builder with convenience methods
 *
 * @example
 * ```typescript
 * const temporal = useMinuta({ adapter: nativeAdapter, date: new Date() });
 *
 * const year = temporal.period(new Date(), 'year');
 * const months = temporal.divide(year, 'month');
 * ```
 */
export function createMinutaBuilder(
  temporal: ReactMinuta,
  setBrowsingDate: (date: Date) => void
): MinutaBuilder {
  return {
    ...temporal,

    derivePeriod(date: Date, unit: AdapterUnit): TimePeriod {
      return derivePeriod(temporal.adapter, date, unit);
    },

    createPeriod(start: Date, end: Date): TimePeriod {
      return createPeriod(start, end);
    },

    divide(period: TimePeriod, unit: AdapterUnit): TimePeriod[] {
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

      setBrowsingDate(result.start);

      return result;
    },

    previous(period: TimePeriod, count: number = 1): TimePeriod {
      const result =
        count === 1
          ? previous(temporal.adapter, period)
          : go(temporal.adapter, period, -count);

      setBrowsingDate(result.start);

      return result;
    },

    go(period: TimePeriod, count: number): TimePeriod {
      const result = go(temporal.adapter, period, count);

      setBrowsingDate(result.start);

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
