import type { Period, Adapter, AdapterUnit } from "../types";
import { validatePeriod } from "./validate";

const DEFAULT_MAX_PERIODS = 100_000;

export interface DivideOptions {
  /** Maximum number of periods before throwing. Default: 100,000. */
  maxPeriods?: number;
}

/**
 * Divide a period into smaller units
 */
export function divide(
  adapter: Adapter,
  period: Period,
  unit: AdapterUnit,
  { maxPeriods = DEFAULT_MAX_PERIODS }: DivideOptions = {}
): Period[] {
  validatePeriod(period);
  const periods: Period[] = [];
  let current = new Date(period.start);

  while (current <= period.end) {
    const start = adapter.startOf(current, unit);
    const end = adapter.endOf(current, unit);

    // Only include periods that overlap with the parent period
    if (end >= period.start && start <= period.end) {
      periods.push({
        start: start < period.start ? period.start : start,
        end: end > period.end ? period.end : end,
        type: unit,
      });
    }

    // Move to the start of the next unit to avoid issues with variable length units
    const nextDate = adapter.add(start, 1, unit);

    // If the next date is the same as the current one (e.g. DST), we must advance manually
    if (nextDate.getTime() <= current.getTime()) {
      current = adapter.add(start, 2, unit);
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
