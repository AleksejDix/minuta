import type { Period, Adapter, AdapterUnit } from "../types";
import { derivePeriod } from "./period";
import { shiftCustomPeriod } from "./customPeriod";
import { getPeriodNavigator } from "./periodNavigation";

/**
 * Move to the previous period
 */
export function previous(adapter: Adapter, p: Period): Period {
  const navigator = getPeriodNavigator(p.type);
  if (navigator) {
    return navigator(adapter, p, -1);
  }

  if (p.type === "custom") {
    return shiftCustomPeriod(p, -1);
  }

  const unit: AdapterUnit = p.type;
  const prevValue = adapter.add(p.start, -1, unit);

  return derivePeriod(adapter, prevValue, unit);
}
