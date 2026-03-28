import type { TimePeriod, Adapter } from "../types";
import { go } from "./go";

/**
 * Move to the previous period
 */
export function previous(adapter: Adapter, p: TimePeriod): TimePeriod {
  return go(adapter, p, -1);
}
