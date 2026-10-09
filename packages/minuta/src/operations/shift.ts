import type { Period, Units } from "#src/types";
import { move } from "./move";
import { periodWith } from "./period";
import { specFor } from "#src/units";

const NO_STEPS = 0;
const ONE = 1;
const INCLUSIVE_END_MS = 1;

/**
 * Move a period by `steps` of its own unit. A custom period moves by its own
 * length.
 *
 * @example
 * shiftWith(units, march, 2)  // May
 * shiftWith(units, march, -1) // February
 *
 * @param units - Available unit specs
 * @param period - Period to move
 * @param steps - How many periods to move; negative moves back
 * @returns The moved period, or the same period for 0 steps
 */
function shiftWith(units: Units, period: Period, steps: number): Period {
  if (steps === NO_STEPS) {
    return period;
  }
  if (period.unit === "custom") {
    const length =
      period.end.getTime() - period.start.getTime() + INCLUSIVE_END_MS;
    return move(period, new Date(period.start.getTime() + length * steps));
  }
  const spec = specFor(units, period.unit);
  return periodWith(units, spec.add(period.start, steps), period.unit);
}

/**
 * The next period of the same unit.
 *
 * @example
 * nextWith(nativeUnits(), periodWith(nativeUnits(), new Date(2026, 2, 15), "month")); // April 2026
 *
 * @param units - Available unit specs
 * @param period - Current period
 * @returns The following period
 */
function nextWith(units: Units, period: Period): Period {
  return shiftWith(units, period, ONE);
}

/**
 * The previous period of the same unit.
 *
 * @example
 * previousWith(nativeUnits(), periodWith(nativeUnits(), new Date(2026, 2, 15), "month")); // February 2026
 *
 * @param units - Available unit specs
 * @param period - Current period
 * @returns The preceding period
 */
function previousWith(units: Units, period: Period): Period {
  return shiftWith(units, period, -ONE);
}

export { nextWith, previousWith, shiftWith };
