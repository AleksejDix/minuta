import type { Period, ReadonlyPeriod } from "#src/types";

/**
 * Constrain a period to fit within bounds.
 *
 * Returns null if the period is entirely outside bounds.
 *
 * @example
 * const selection = createPeriod(new Date(2026, 0, 5), new Date(2026, 0, 25))
 * const allowed = createPeriod(new Date(2026, 0, 10), new Date(2026, 0, 20))
 * clamp(selection, allowed)
 * // → { start: Jan 10, end: Jan 20, type: "custom" }
 * @param period - The period to constrain
 * @param bounds - The allowed range
 * @returns The clamped custom period, or null when there is no overlap
 */
function clamp(period: ReadonlyPeriod, bounds: ReadonlyPeriod): Period | null {
  const start = Math.max(period.start.getTime(), bounds.start.getTime());
  const end = Math.min(period.end.getTime(), bounds.end.getTime());

  if (start > end) {
    // oxlint-disable-next-line unicorn/no-null -- Public API returns null; changing it would break callers
    return null;
  }

  return { end: new Date(end), start: new Date(start), type: "custom" };
}

export { clamp };
