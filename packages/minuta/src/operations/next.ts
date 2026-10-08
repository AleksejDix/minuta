import type { Adapter, Period, ReadonlyPeriod } from "#src/types";
import { go } from "./go";

const FORWARD = 1;

/**
 * Move to the next period
 *
 * @param adapter - The date adapter to use
 * @param period - The current period
 * @returns The following period of the same type
 */
function next(adapter: Readonly<Adapter>, period: ReadonlyPeriod): Period {
  return go(adapter, period, FORWARD);
}

export { next };
