import type { Period, Adapter } from "../types";
import { go } from "./go";

/**
 * Move to the previous period
 */
export function previous(adapter: Adapter, p: Period): Period {
  return go(adapter, p, -1);
}
