import type { Period, Adapter } from "../types";
import { go } from "./go";

/**
 * Move to the next period
 */
export function next(adapter: Adapter, p: Period): Period {
  return go(adapter, p, 1);
}
