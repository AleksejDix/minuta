import type { Period, Adapter, AdapterUnit, Unit } from "../types";

// Type for custom period options
interface CustomPeriodOptions {
  start: Date;
  end: Date;
}

/**
 * Create a period of a specific type from a date
 * @param adapter - The adapter instance
 * @param date - The date to create the period from
 * @param unit - The unit type (must be an adapter unit, not "custom"/"stableMonth"/"stableYear")
 * @returns A period of the specified type
 */
export function period(adapter: Adapter, date: Date, unit: AdapterUnit): Period;

/**
 * Create a custom period with specific start and end dates
 * @param adapter - The adapter instance (for consistency)
 * @param options - Object with start and end dates
 * @returns A custom period
 */
export function period(adapter: Adapter, options: CustomPeriodOptions): Period;

/**
 * Create a period of a specific type from a date or create a custom period
 *
 * @example
 * // Standard period from date
 * period(adapter, new Date(), "month")
 *
 * @example
 * // Custom period with start and end
 * period(adapter, { start: new Date('2024-01-01'), end: new Date('2024-03-31') })
 */
export function period(
  adapter: Adapter,
  dateOrOptions: Date | CustomPeriodOptions,
  unit?: Unit
): Period {
  // Check if this is a custom period request
  if ("start" in dateOrOptions && "end" in dateOrOptions) {
    // Custom period logic
    const { start, end } = dateOrOptions;
    return {
      start,
      end,
      type: "custom",
      date: new Date((start.getTime() + end.getTime()) / 2),
    };
  }

  // Standard period logic
  const date = dateOrOptions as Date;
  const type = unit!;

  if (type === "custom" || type === "stableMonth" || type === "stableYear") {
    throw new Error(
      `Cannot create period with unit "${type}" from a date. Use period(adapter, {start, end}) for custom periods, or createStableMonth()/createStableYear() from '@allystudio/usetemporal/calendar'.`
    );
  }

  const start = adapter.startOf(date, type);
  const end = adapter.endOf(date, type);

  return {
    start,
    end,
    type,
    date,
  };
}
