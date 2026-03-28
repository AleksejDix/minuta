import type { Period, Adapter, AdapterUnit } from "../types";
import { derivePeriod } from "./period";
import { shiftCustomPeriod } from "./customPeriod";
import { getPeriodNavigator } from "./periodNavigation";

/**
 * Move to the next period
 */
export function next(adapter: Adapter, p: Period): Period {
  const navigator = getPeriodNavigator(p.type);
  if (navigator) {
    return navigator(adapter, p, 1);
  }

  if (p.type === "custom") {
    return shiftCustomPeriod(p, 1);
  }

  const unit: AdapterUnit = p.type;
  const nextValue = adapter.add(p.start, 1, unit);

  return derivePeriod(adapter, nextValue, unit);
}
