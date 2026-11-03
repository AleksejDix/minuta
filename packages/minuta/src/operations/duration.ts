import type { Period, Unit, Units } from "#src/types";
import { isDatePeriod, zonedPeriod } from "#src/values";
import { specFor, timeSpecFor, timeZoneOf } from "#src/units";
import type { Temporal } from "@js-temporal/polyfill";

/**
 * The period's length: whole days for a date period, exact hours, minutes
 * and smaller for a time period.
 *
 * @example
 * length(march); // P31D
 * length(zurichDayOfClockChange); // PT23H, as hours (a time period)
 *
 * @param period - The period to measure
 * @returns The length as a Temporal duration
 */
function length(period: Period): Temporal.Duration {
  if (isDatePeriod(period)) {
    return period.start.until(period.end, { largestUnit: "day" });
  }
  return period.start.until(period.end, { largestUnit: "hour" });
}

/**
 * How many complete `unit`s fit into a period, counted from its start with
 * the units' calendar and clock rules. A date period counted in a time unit
 * (a day in hours) becomes moments in the units' time zone first, so a day
 * the clocks change on has 23 or 25 hours.
 *
 * @example
 * durationWith(units, march, "day"); // 31
 * durationWith(units, period(Temporal.PlainDate.from("2026-03-29"), "day"), "hour"); // 23 in Zurich
 *
 * @param units - Available unit specs
 * @param period - The period to measure
 * @param unit - The unit to count
 * @returns The number of complete units from the start
 */
function durationWith(units: Units, period: Period, unit: Unit): number {
  if (isDatePeriod(period)) {
    const spec = specFor(units, unit);
    if (spec.kind === "date") {
      return spec.diff(period.start, period.end);
    }
    const zoned = zonedPeriod(period, timeZoneOf(units));
    return spec.diff(zoned.start, zoned.end);
  }
  return timeSpecFor(units, unit).diff(period.start, period.end);
}

export { durationWith, length };
