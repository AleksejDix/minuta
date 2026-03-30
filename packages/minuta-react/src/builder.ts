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
import type { MinutaBuilder, ReactMinuta } from "./types";

/**
 * Create a minuta builder with convenient method wrappers
 *
 * This wraps pure operations with automatic adapter passing.
 * Each method is tree-shakable - unused methods add 0KB to bundle.
 *
 * @param minuta - The base minuta instance
 * @param setBrowsingDate - React state setter for browsing date
 * @returns A minuta builder with convenience methods
 *
 * @example
 * ```typescript
 * const minuta = useMinuta({ adapter: nativeAdapter, date: new Date() });
 *
 * const year = minuta.period(new Date(), 'year');
 * const months = minuta.divide(year, 'month');
 * ```
 */
export function createMinutaBuilder(
  minuta: ReactMinuta,
  setBrowsingDate: (date: Date) => void
): MinutaBuilder {
  return {
    ...minuta,

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

      setBrowsingDate(result.start);

      return result;
    },

    previous(period: Period, count: number = 1): Period {
      const result =
        count === 1
          ? previous(minuta.adapter, period)
          : go(minuta.adapter, period, -count);

      setBrowsingDate(result.start);

      return result;
    },

    go(period: Period, count: number): Period {
      const result = go(minuta.adapter, period, count);

      setBrowsingDate(result.start);

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
