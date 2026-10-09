import type { Period, Unit, Units } from "#src/types";
import { specFor } from "#src/units";

const NONE = 0;
const ONE = 1;

/**
 * The period's length in milliseconds, measured over the half-open range
 * `[start, end + 1 ms)`, so a whole day is exactly one day long.
 *
 * @example
 * length(period(new Date(2026, 9, 8), "day")); // 86400000, outside a DST change
 *
 * @param period - The period to measure
 * @returns The length in milliseconds
 */
function length(period: Period): number {
  return period.end.getTime() + ONE - period.start.getTime();
}

/**
 * How many complete `unit`s fit into a period, measured over the half-open
 * range `[start, end + 1 ms)` with the units' own calendar and DST rules.
 *
 * @example
 * durationWith(units, period(new Date(2026, 9, 8), "day"), "hour"); // 24
 * durationWith(units, period(new Date(2026, 1, 1), "month"), "day"); // 28
 *
 * @param units - Available unit specs
 * @param period - The period to measure
 * @param unit - The unit to count
 * @returns The number of complete units from the start
 */
function durationWith(units: Units, period: Period, unit: Unit): number {
  const spec = specFor(units, unit);
  const { start } = period;
  const end = period.end.getTime() + ONE;
  // `diff` may count boundaries rather than complete units; correct it
  let count = spec.diff(start, new Date(end));
  while (count > NONE && spec.add(start, count).getTime() > end) {
    count -= ONE;
  }
  while (spec.add(start, count + ONE).getTime() <= end) {
    count += ONE;
  }
  return count;
}

export { durationWith, length };
