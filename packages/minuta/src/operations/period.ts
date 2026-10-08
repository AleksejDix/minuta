import type { Adapter, AdapterUnit, Period } from "#src/types";
import { validatePeriod } from "./validate";

/**
 * Derive a period's boundaries from the adapter for a given date and unit.
 *
 * @param adapter - The date adapter to use
 * @param date - Any date within the target period
 * @param unit - The unit of the period
 * @returns The period of the given unit containing the date
 *
 * @example
 * derivePeriod(adapter, new Date("2025-03-15"), "month")
 * // { start: Mar 1, end: Mar 31, type: "month" }
 */
function derivePeriod(
  adapter: Readonly<Adapter>,
  date: Readonly<Date>,
  unit: AdapterUnit
): Period {
  const start = adapter.startOf(date, unit);
  const end = adapter.endOf(date, unit);
  const period = { end, start, type: unit };
  validatePeriod(period);
  return period;
}

/**
 * Create a custom period with explicit start and end dates.
 * No adapter needed — you define the boundaries.
 *
 * @param start - The first millisecond of the period
 * @param end - The last millisecond of the period
 * @returns The custom period
 *
 * @example
 * createPeriod(new Date("2025-01-01"), new Date("2025-03-31"))
 * // { start: Jan 1, end: Mar 31, type: "custom" }
 */
function createPeriod(start: Readonly<Date>, end: Readonly<Date>): Period {
  const period = { end, start, type: "custom" as const };
  validatePeriod(period);
  return period;
}

export { createPeriod, derivePeriod };
