import type { Period, Unit, Units } from "#src/types";
import { specFor } from "#src/units";

/**
 * Whether two periods fall into the same `unit` (compared by their starts).
 * With `"custom"`, both edges must be identical.
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
  unit: Unit | "custom"
): boolean {
  if (unit === "custom") {
    return (
      first.start.getTime() === second.start.getTime() &&
      first.end.getTime() === second.end.getTime()
    );
  }
  const spec = specFor(units, unit);
  return (
    spec.startOf(first.start).getTime() === spec.startOf(second.start).getTime()
  );
}

export { sameWith };
