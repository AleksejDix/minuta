import type { Period, Adapter, AdapterUnit } from "../types";
import { period } from "./period";
import { shiftCustomPeriod } from "./customPeriod";

/**
 * Move by a specific number of periods
 */
export function go(adapter: Adapter, p: Period, steps: number): Period {
  if (steps === 0) return p;

  if (
    p.type === "custom" ||
    p.type === "stableMonth" ||
    p.type === "stableYear"
  ) {
    return shiftCustomPeriod(p, steps);
  }

  const unit: AdapterUnit = p.type;
  let newValue: Date;

  // Special handling for large day steps to handle leap years correctly
  if (unit === "day" && Math.abs(steps) >= 365) {
    const years = Math.floor(steps / 365);
    const remainingDays = steps % 365;

    let result = adapter.add(p.date, years, "year");

    if (remainingDays !== 0) {
      result = adapter.add(result, remainingDays, "day");
    }

    newValue = result;
  } else {
    newValue = adapter.add(p.date, steps, unit);
  }

  return period(adapter, newValue, unit);
}
