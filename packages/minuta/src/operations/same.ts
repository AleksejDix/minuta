import type { Period, Unit, Units } from "#src/types";
import { compare, toPlainDate, toZoned } from "#src/values";
import { specFor, timeZoneOf } from "#src/units";

const EQUAL = 0;

/**
 * Whether two periods fall into the same `unit`, compared by their starts:
 * the same calendar unit for date units, the same moment's unit for time
 * units. For identical periods, use `equals`.
 *
 * @example
 * sameWith(units, mondayPeriod, fridayPeriod, "week") // true
 *
 * @param units - Available unit specs
 * @param first - One period
 * @param second - The other period
 * @param unit - Granularity of the comparison
 * @returns Whether both periods are in the same unit
 */
// oxlint-disable-next-line eslint/max-params -- Context-first core signature: (units, first, second, unit)
function sameWith(
  units: Units,
  first: Period,
  second: Period,
  unit: Unit
): boolean {
  const spec = specFor(units, unit);
  const timeZone = timeZoneOf(units);
  if (spec.kind === "date") {
    return (
      compare(
        spec.startOf(toPlainDate(first.start, timeZone)),
        spec.startOf(toPlainDate(second.start, timeZone))
      ) === EQUAL
    );
  }
  return (
    compare(
      spec.startOf(toZoned(first.start, timeZone)),
      spec.startOf(toZoned(second.start, timeZone))
    ) === EQUAL
  );
}

export { sameWith };
