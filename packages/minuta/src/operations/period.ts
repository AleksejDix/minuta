import type { Period, Unit, Units } from "#src/types";
import { assertValidDate, specFor } from "#src/units";

/**
 * The period of `unit` that contains `date`.
 *
 * @example
 * periodWith(units, new Date(2026, 2, 15), "month")
 * // { start: Mar 1 00:00, end: Mar 31 23:59:59.999, unit: "month" }
 *
 * @param units - Available unit specs
 * @param date - Any date inside the period
 * @param unit - Unit of the period
 * @returns The unit-aligned period
 * @throws {RangeError} For an invalid date or a unit missing from `units`
 */
function periodWith(units: Units, date: Readonly<Date>, unit: Unit): Period {
  assertValidDate(date, "date");
  const spec = specFor(units, unit);
  return { end: spec.endOf(date), start: spec.startOf(date), unit };
}

/**
 * A custom period from `start` to `end` (inclusive). Forgiving: dates given in
 * reverse order are swapped.
 *
 * @example
 * range(new Date(2026, 0, 1), new Date(2026, 2, 31))
 * // { start: Jan 1, end: Mar 31, unit: "custom" }
 *
 * @param start - One edge of the range
 * @param end - The other edge of the range
 * @returns The custom period
 * @throws {RangeError} For an invalid date
 */
function range(start: Readonly<Date>, end: Readonly<Date>): Period {
  assertValidDate(start, "start");
  assertValidDate(end, "end");
  if (start.getTime() > end.getTime()) {
    return { end: start, start: end, unit: "custom" };
  }
  return { end, start, unit: "custom" };
}

export { periodWith, range };
