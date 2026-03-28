import * as ops from "@allystudio/usetemporal/operations";
import type { AdapterUnit, Period } from "@allystudio/usetemporal";
import type { TemporalBuilder, SvelteTemporal } from "./types";

/**
 * Create a temporal builder with convenient method wrappers.
 */
export function createTemporalBuilder(
  temporal: SvelteTemporal
): TemporalBuilder {
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
    set weekStartsOn(value: number) {
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

    derivePeriod(date: Date, unit: AdapterUnit): Period {
      return ops.derivePeriod(temporal.adapter, date, unit);
    },

    createPeriod(start: Date, end: Date): Period {
      return ops.createPeriod(start, end);
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

      temporal.browsing.set(result);
      return result;
    },

    previous(period: Period, count: number = 1): Period {
      const result =
        count === 1
          ? ops.previous(temporal.adapter, period)
          : ops.go(temporal.adapter, period, -count);

      temporal.browsing.set(result);
      return result;
    },

    go(period: Period, count: number): Period {
      const result = ops.go(temporal.adapter, period, count);
      temporal.browsing.set(result);
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
