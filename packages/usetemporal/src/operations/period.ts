import type { Period, Adapter, AdapterUnit } from "../types";

/**
 * Derive a period's boundaries from the adapter for a given date and unit.
 * The adapter calculates startOf/endOf for the unit containing the date.
 *
 * @example
 * derivePeriod(adapter, new Date("2025-03-15"), "month")
 * // { start: Mar 1, end: Mar 31, type: "month", date: Mar 15 }
 */
export function derivePeriod(
  adapter: Adapter,
  date: Date,
  unit: AdapterUnit
): Period {
  if (
    (unit as string) === "custom" ||
    (unit as string) === "stableMonth" ||
    (unit as string) === "stableYear"
  ) {
    throw new Error(
      `Cannot derive period for unit "${unit}". Use createPeriod(start, end) for custom periods, or createStableMonth()/createStableYear() from '@allystudio/usetemporal/calendar'.`
    );
  }

  const start = adapter.startOf(date, unit);
  const end = adapter.endOf(date, unit);

  return {
    start,
    end,
    type: unit,
    date,
  };
}

/**
 * Create a custom period with explicit start and end dates.
 * No adapter needed — you define the boundaries.
 *
 * @example
 * createPeriod(new Date("2025-01-01"), new Date("2025-03-31"))
 * // { start: Jan 1, end: Mar 31, type: "custom", date: midpoint }
 */
export function createPeriod(start: Date, end: Date): Period {
  return {
    start,
    end,
    type: "custom",
    date: new Date((start.getTime() + end.getTime()) / 2),
  };
}
