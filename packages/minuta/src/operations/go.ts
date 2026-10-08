import type { Adapter, AdapterUnit, Period, ReadonlyPeriod } from "#src/types";
import { derivePeriod } from "./period";
import { move } from "./move";

const NO_STEPS = 0;
const INCLUSIVE_END_MS = 1;

/**
 * Move by a specific number of periods.
 * Only accepts Period (adapter units + custom).
 *
 * @param adapter - The date adapter
 * @param period - The period to move
 * @param steps - How many periods to move (negative moves backwards)
 * @returns The moved period
 */
function go(
  adapter: Readonly<Adapter>,
  period: ReadonlyPeriod,
  steps: number
): Period {
  if (steps === NO_STEPS) {
    return period;
  }

  if (period.type === "custom") {
    const durationMs =
      period.end.getTime() - period.start.getTime() + INCLUSIVE_END_MS;
    return move(period, new Date(period.start.getTime() + durationMs * steps));
  }

  const unit: AdapterUnit = period.type;
  const newValue = adapter.add(period.start, steps, unit);

  return derivePeriod(adapter, newValue, unit);
}

export { go };
