import type { Period, Adapter, AdapterUnit } from "../types";
import { validatePeriod } from "./validate";

/**
 * Derive a period's boundaries from the adapter for a given date and unit.
 *
 * @example
 * derivePeriod(adapter, new Date("2025-03-15"), "month")
 * // { start: Mar 1, end: Mar 31, type: "month" }
 */
export function derivePeriod(
  adapter: Adapter,
  date: Date,
  unit: AdapterUnit
): Period {
  const start = adapter.startOf(date, unit);
  const end = adapter.endOf(date, unit);
  const p = { start, end, type: unit };
  validatePeriod(p);
  return p;
}

/**
 * Create a custom period with explicit start and end dates.
 * No adapter needed — you define the boundaries.
 *
 * @example
 * createPeriod(new Date("2025-01-01"), new Date("2025-03-31"))
 * // { start: Jan 1, end: Mar 31, type: "custom" }
 */
export function createPeriod(start: Date, end: Date): Period {
  const p = { start, end, type: "custom" as const };
  validatePeriod(p);
  return p;
}
