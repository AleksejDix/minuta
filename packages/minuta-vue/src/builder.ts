import type { Adapter, Period, ReadonlyPeriod } from "minuta";
import type { MinutaBuilder, VueMinuta } from "./types";
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

const SINGLE_STEP = 1;

type MinutaOperations = Omit<MinutaBuilder, keyof VueMinuta>;

/**
 * Moves forward by one unit with next(), or by several with go().
 *
 * @param adapter - The date adapter
 * @param period - The period to move from
 * @param count - The number of units to move
 * @returns The moved period
 */
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

/**
 * Moves backward by one unit with previous(), or by several with go().
 *
 * @param adapter - The date adapter
 * @param period - The period to move from
 * @param count - The number of units to move back
 * @returns The moved period
 */
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

/**
 * Create the operation wrappers that pass the current adapter.
 * Navigation methods also update the browsing period.
 *
 * @param minuta - The base minuta instance
 * @returns The operation wrappers
 */
function createOperations(
  // oxlint-disable-next-line typescript/prefer-readonly-parameter-types -- VueMinuta holds Vue refs, which are mutable by design
  minuta: VueMinuta
): MinutaOperations {
  return {
    contains: (period, dateOrPeriod) => contains(period, dateOrPeriod),
    createPeriod: (start, end) => createPeriod(start, end),
    derivePeriod: (date, unit) => derivePeriod(minuta.adapter, date, unit),
    divide: (period, unit) => divide(minuta.adapter, period, unit),
    go: (period, count) => {
      const result = go(minuta.adapter, period, count);
      minuta.browsing.value = result;
      return result;
    },
    isSame: (period1, period2, unit) =>
      isSame(minuta.adapter, period1, period2, unit),
    merge: (periods, targetUnit) => mergeOp(periods, targetUnit),
    next: (period, count = SINGLE_STEP) => {
      const result = stepForward(minuta.adapter, period, count);
      minuta.browsing.value = result;
      return result;
    },
    previous: (period, count = SINGLE_STEP) => {
      const result = stepBackward(minuta.adapter, period, count);
      minuta.browsing.value = result;
      return result;
    },
    split: (period, date) => split(period, date),
  };
}

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
function createMinutaBuilder(
  // oxlint-disable-next-line typescript/prefer-readonly-parameter-types -- The builder's setters write through to this instance
  minuta: VueMinuta
): MinutaBuilder {
  const operations = createOperations(minuta);
  return {
    get adapter() {
      return minuta.adapter;
    },
    set adapter(value) {
      minuta.adapter = value;
    },
    get browsing() {
      return minuta.browsing;
    },
    set browsing(value) {
      minuta.browsing = value;
    },
    contains: operations.contains,
    createPeriod: operations.createPeriod,
    derivePeriod: operations.derivePeriod,
    divide: operations.divide,
    go: operations.go,
    isSame: operations.isSame,
    get locale() {
      return minuta.locale;
    },
    set locale(value: string) {
      minuta.locale = value;
    },
    merge: operations.merge,
    next: operations.next,
    get now() {
      return minuta.now;
    },
    set now(value) {
      minuta.now = value;
    },
    previous: operations.previous,
    split: operations.split,
    get weekStartsOn() {
      return minuta.weekStartsOn;
    },
    set weekStartsOn(value) {
      minuta.weekStartsOn = value;
    },
  };
}

export { createMinutaBuilder };
