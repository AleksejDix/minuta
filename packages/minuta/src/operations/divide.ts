import type { Period, Adapter, AdapterUnit } from "../types";
import { validatePeriod } from "./validate";

const DEFAULT_MAX_PERIODS = 100_000;

export interface DivideOptions {
  /** Maximum number of periods before throwing. Default: 100,000. */
  maxPeriods?: number;
}

/**
 * Divide a period into smaller units.
 *
 * @param adapter - The date adapter
 * @param period - The period to divide
 * @param unit - The unit to divide by
 * @param count - How many units per chunk (default: 1).
 *   divide(adapter, day, "minute", 15) → 15-minute intervals
 *
 * @example
 * divide(adapter, month, "day")         // 28-31 day periods
 * divide(adapter, hour, "minute", 15)   // 4 fifteen-minute periods
 * divide(adapter, day, "minute", 30)    // 48 thirty-minute periods
 */
export function divide(
  adapter: Adapter,
  period: Period,
  unit: AdapterUnit,
  count: number | DivideOptions = 1,
  options: DivideOptions = {}
): Period[] {
  // Handle backward-compatible options-as-4th-arg
  let step: number;
  let maxPeriods: number;
  if (typeof count === "object") {
    step = 1;
    maxPeriods = count.maxPeriods ?? DEFAULT_MAX_PERIODS;
  } else {
    step = count;
    maxPeriods = options.maxPeriods ?? DEFAULT_MAX_PERIODS;
  }

  validatePeriod(period);
  const periods: Period[] = [];
  let current = new Date(period.start);

  while (current <= period.end) {
    const start = adapter.startOf(current, unit);
    const end = new Date(adapter.add(start, step, unit).getTime() - 1);

    // Only include periods that overlap with the parent period
    if (end >= period.start && start <= period.end) {
      periods.push({
        start: start < period.start ? period.start : start,
        end: end > period.end ? period.end : end,
        type: step === 1 ? unit : "custom",
      });
    }

    // Move to next chunk
    const nextDate = adapter.add(start, step, unit);

    if (nextDate.getTime() <= current.getTime()) {
      current = adapter.add(start, step * 2, unit);
    } else {
      current = nextDate;
    }

    if (periods.length > maxPeriods) {
      throw new Error(
        `divide() generated over ${maxPeriods} periods — use a larger unit, smaller parent period, or increase maxPeriods`
      );
    }
  }

  return periods;
}
