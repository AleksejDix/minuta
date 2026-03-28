import * as ops from "@allystudio/usetemporal/operations";
import type { AdapterUnit, Period, Unit } from "@allystudio/usetemporal";
import type { TemporalBuilder, ReactTemporal } from "./types";

/**
 * Create a temporal builder with convenient method wrappers
 *
 * This wraps pure operations with automatic adapter passing.
 * Each method is tree-shakable - unused methods add 0KB to bundle.
 *
 * @param temporal - The base temporal instance
 * @param setBrowsingDate - React state setter for browsing date
 * @returns A temporal builder with convenience methods
 *
 * @example
 * ```typescript
 * const temporal = useTemporal({ adapter: nativeAdapter, date: new Date() });
 *
 * const year = temporal.period(new Date(), 'year');
 * const months = temporal.divide(year, 'month');
 * ```
 */
export function createTemporalBuilder(
  temporal: ReactTemporal,
  setBrowsingDate: (date: Date) => void
): TemporalBuilder {
  return {
    ...temporal,

    period(dateOrOptions: Date | CustomPeriodOptions, unit?: Unit): Period {
      if (typeof dateOrOptions === "object" && "start" in dateOrOptions) {
        return ops.createPeriod(dateOrOptions.start, dateOrOptions.end);
      }
      return ops.derivePeriod(
        temporal.adapter,
        dateOrOptions as Date,
        unit! as AdapterUnit
      );
    },

    divide(period: Period, unit: AdapterUnit): Period[] {
      return ops.divide(temporal.adapter, period, unit);
    },

    merge(periods: Period[], targetUnit?: AdapterUnit): Period {
      return ops.merge(temporal.adapter, periods, targetUnit);
    },

    next(period: Period, count: number = 1): Period {
      const result =
        count === 1
          ? ops.next(temporal.adapter, period)
          : ops.go(temporal.adapter, period, count);

      setBrowsingDate(result.start);

      return result;
    },

    previous(period: Period, count: number = 1): Period {
      const result =
        count === 1
          ? ops.previous(temporal.adapter, period)
          : ops.go(temporal.adapter, period, -count);

      setBrowsingDate(result.start);

      return result;
    },

    go(period: Period, count: number): Period {
      const result = ops.go(temporal.adapter, period, count);

      setBrowsingDate(result.start);

      return result;
    },

    split(period: Period, date: Date): [Period, Period] {
      return ops.split(period, date);
    },

    contains(period: Period, dateOrPeriod: Date | Period): boolean {
      return ops.contains(period, dateOrPeriod);
    },

    isSame(
      period1: Period,
      period2: Period,
      unit: AdapterUnit | "custom"
    ): boolean {
      return ops.isSame(temporal.adapter, period1, period2, unit);
    },
  };
}

interface CustomPeriodOptions {
  start: Date;
  end: Date;
}
