import type { Period, Adapter } from "../../types";
import { isSame } from "../isSame";
import { derivePeriod } from "../period";

/**
 * Checks if a period represents today
 */
export function isToday(adapter: Adapter, now: Date, p: Period): boolean {
  if (p.type !== "day") {
    return false;
  }

  const today = derivePeriod(adapter, now, "day");
  return isSame(adapter, p, today, "day");
}
