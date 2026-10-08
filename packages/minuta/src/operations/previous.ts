import type { Adapter, Period, ReadonlyPeriod } from "#src/types";
import { go } from "./go";

const BACKWARD = -1;

/**
 * Move to the previous period
 *
 * @param adapter - The date adapter to use
 * @param period - The current period
 * @returns The preceding period of the same type
 */
function previous(adapter: Readonly<Adapter>, period: ReadonlyPeriod): Period {
  return go(adapter, period, BACKWARD);
}

export { previous };
