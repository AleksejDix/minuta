import type { Period, Unit, UnitSpec, Units } from "#src/types";
import { endFrom, specFor } from "#src/units";

const NONE = 0;
const ONE = 1;

// Units of a fixed length: the engine's difference is plain arithmetic
const FIXED_LENGTH: ReadonlySet<string> = new Set(["hour", "minute", "second"]);

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
 * How many whole units start at `start` and end within `period`, walking
 * unit ends like `divideWith`. A day that starts at 01:00 (Beirut, Mar 31
 * 2024) is 23 hours long, which an engine counts as 0 days; counted by its
 * boundaries it is one.
 *
 * @param spec - The unit's spec
 * @param period - The period to measure, starting at a unit start
 * @returns The number of whole units
 */
function countBoundaries(spec: UnitSpec, period: Period): number {
  let count = NONE;
  let end = endFrom(spec, period.start);
  while (end <= period.end) {
    count += ONE;
    end = endFrom(spec, new Date(end.getTime() + ONE));
  }
  return count;
}

/**
 * How many complete `unit`s fit into a period, measured over the half-open
 * range `[start, end + 1 ms)` with the units' own calendar and DST rules.
 * From a unit start, calendar units are counted by their boundaries, so a
 * day without a midnight is still one day.
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
  if (
    !FIXED_LENGTH.has(unit) &&
    spec.startOf(period.start).getTime() === period.start.getTime()
  ) {
    return countBoundaries(spec, period);
  }
  const end = new Date(period.end.getTime() + ONE);
  return spec.diff(period.start, end);
}

export { durationWith, length };
