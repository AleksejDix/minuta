import type { TimePeriod, Adapter } from "../types";
import { go } from "./go";

/**
 * Move to the next period
 */
export function next(adapter: Adapter, p: TimePeriod): TimePeriod {
  return go(adapter, p, 1);
}
