import type { Adapter, AdapterUnit, ReadonlyPeriod } from "#src/types";

/**
 * Check if two periods are the same for a given unit.
 * For adapter units: compares start dates normalized to the unit boundary.
 * For custom: compares both start and end (exact match).
 *
 * @param adapter - The date adapter to use
 * @param first - The first period
 * @param second - The second period
 * @param unit - The unit to compare by, or "custom" for an exact match
 * @returns True when both periods are the same for the unit
 */
// oxlint-disable-next-line eslint/max-params -- Public API signature takes four positional parameters
function isSame(
  adapter: Readonly<Adapter>,
  first: ReadonlyPeriod,
  second: ReadonlyPeriod,
  unit: AdapterUnit | "custom"
): boolean {
  if (unit === "custom") {
    return (
      first.start.getTime() === second.start.getTime() &&
      first.end.getTime() === second.end.getTime()
    );
  }

  const startA = adapter.startOf(first.start, unit);
  const startB = adapter.startOf(second.start, unit);
  return startA.getTime() === startB.getTime();
}

export { isSame };
