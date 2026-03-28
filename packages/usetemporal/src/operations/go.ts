import type { TimePeriod, Adapter, AdapterUnit } from "../types";
import { derivePeriod } from "./period";
import { shiftCustomPeriod } from "./customPeriod";

/**
 * Move by a specific number of periods.
 * Only accepts TimePeriod (adapter units + custom).
 */
export function go(adapter: Adapter, p: TimePeriod, steps: number): TimePeriod {
  if (steps === 0) return p;

  if (p.type === "custom") {
    return shiftCustomPeriod(p, steps);
  }

  const unit: AdapterUnit = p.type;
  const newValue = adapter.add(p.start, steps, unit);

  return derivePeriod(adapter, newValue, unit);
}
