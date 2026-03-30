import type { Period, Adapter, AdapterUnit } from "../types";
import { derivePeriod } from "./period";
import { move } from "./move";

/**
 * Move by a specific number of periods.
 * Only accepts Period (adapter units + custom).
 */
export function go(adapter: Adapter, p: Period, steps: number): Period {
  if (steps === 0) return p;

  if (p.type === "custom") {
    const durationMs = p.end.getTime() - p.start.getTime() + 1;
    return move(p, new Date(p.start.getTime() + durationMs * steps));
  }

  const unit: AdapterUnit = p.type;
  const newValue = adapter.add(p.start, steps, unit);

  return derivePeriod(adapter, newValue, unit);
}
