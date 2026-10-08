import type { Adapter, AdapterUnit, Period, ReadonlyPeriod } from "minuta";
import type { MinutaBuilder, ReactMinuta } from "./types";
import {
  contains,
  createPeriod,
  derivePeriod,
  divide,
  go,
  isSame,
  merge as mergeOp,
  next as nextPeriod,
  previous as previousPeriod,
  split,
} from "minuta/operations";

type SetBrowsingDate = (date: Readonly<Date>) => void;

type Navigation = Pick<MinutaBuilder, "go" | "next" | "previous">;

const SINGLE_STEP = 1;

function stepForward(
  adapter: Readonly<Adapter>,
  period: ReadonlyPeriod,
  count: number
): Period {
  if (count === SINGLE_STEP) {
    return nextPeriod(adapter, period);
  }
  return go(adapter, period, count);
}

function stepBackward(
  adapter: Readonly<Adapter>,
  period: ReadonlyPeriod,
  count: number
): Period {
  if (count === SINGLE_STEP) {
    return previousPeriod(adapter, period);
  }
  return go(adapter, period, -count);
}

function createNavigation(
  adapter: Readonly<Adapter>,
  setBrowsingDate: SetBrowsingDate
): Navigation {
  function browseTo(result: ReadonlyPeriod): void {
    setBrowsingDate(result.start);
  }

  return {
    go(period: ReadonlyPeriod, count: number): Period {
      const result = go(adapter, period, count);
      browseTo(result);
      return result;
    },

    next(period: ReadonlyPeriod, count = SINGLE_STEP): Period {
      const result = stepForward(adapter, period, count);
      browseTo(result);
      return result;
    },

    previous(period: ReadonlyPeriod, count = SINGLE_STEP): Period {
      const result = stepBackward(adapter, period, count);
      browseTo(result);
      return result;
    },
  };
}

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
function createMinutaBuilder(
  minuta: ReactMinuta,
  setBrowsingDate: SetBrowsingDate
): MinutaBuilder {
  const { adapter } = minuta;
  const navigation = createNavigation(adapter, setBrowsingDate);

  return {
    adapter,
    browsing: minuta.browsing,
    contains(
      period: ReadonlyPeriod,
      dateOrPeriod: Readonly<Date> | ReadonlyPeriod
    ): boolean {
      return contains(period, dateOrPeriod);
    },
    createPeriod(start: Readonly<Date>, end: Readonly<Date>): Period {
      return createPeriod(start, end);
    },
    derivePeriod(date: Readonly<Date>, unit: AdapterUnit): Period {
      return derivePeriod(adapter, date, unit);
    },
    divide(period: ReadonlyPeriod, unit: AdapterUnit): Period[] {
      return divide(adapter, period, unit);
    },
    go: navigation.go,
    isSame(
      period1: ReadonlyPeriod,
      period2: ReadonlyPeriod,
      unit: AdapterUnit | "custom"
    ): boolean {
      return isSame(adapter, period1, period2, unit);
    },
    merge(
      periods: readonly ReadonlyPeriod[],
      targetUnit?: AdapterUnit
    ): Period {
      return mergeOp(periods, targetUnit);
    },
    next: navigation.next,
    now: minuta.now,
    previous: navigation.previous,
    split(period: ReadonlyPeriod, date: Readonly<Date>): [Period, Period] {
      return split(period, date);
    },
    weekStartsOn: minuta.weekStartsOn,
  };
}

export { createMinutaBuilder };
