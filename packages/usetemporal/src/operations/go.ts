import type { Period, Adapter, AdapterUnit } from "../types";
import { derivePeriod } from "./period";
import { shiftCustomPeriod } from "./customPeriod";
import { getPeriodNavigator } from "./periodNavigation";

/**
 * Move by a specific number of periods
 */
export function go(adapter: Adapter, p: Period, steps: number): Period {
  if (steps === 0) return p;

  const navigator = getPeriodNavigator(p.type);
  if (navigator) {
    return navigator(adapter, p, steps);
  }

  if (p.type === "custom") {
    return shiftCustomPeriod(p, steps);
  }

  const unit: AdapterUnit = p.type;
  const newValue = adapter.add(p.start, steps, unit);

  return derivePeriod(adapter, newValue, unit);
}
