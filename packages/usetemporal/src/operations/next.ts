import type { Period, Adapter, AdapterUnit } from "../types";
import { period } from "./period";
import { shiftCustomPeriod } from "./customPeriod";

/**
 * Move to the next period
 */
export function next(adapter: Adapter, p: Period): Period {
  if (
    p.type === "custom" ||
    p.type === "stableMonth" ||
    p.type === "stableYear"
  ) {
    return shiftCustomPeriod(p, 1);
  }

  const unit: AdapterUnit = p.type;
  const nextValue = adapter.add(p.date, 1, unit);

  return period(adapter, nextValue, unit);
}
