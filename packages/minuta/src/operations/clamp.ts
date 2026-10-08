import type { Period } from "#src/types";

/**
 * Constrain a period to fit within bounds.
 *
 * Returns undefined if the period is entirely outside bounds.
 *
 * @example
 * const selection = range(new Date(2026, 0, 5), new Date(2026, 0, 25))
 * const allowed = range(new Date(2026, 0, 10), new Date(2026, 0, 20))
 * clamp(selection, allowed)
 * // → { start: Jan 10, end: Jan 20, unit: "custom" }
 * @param period - The period to constrain
 * @param bounds - The allowed range
 * @returns The clamped custom period, or undefined when there is no overlap
 */
function clamp(period: Period, bounds: Period): Period | undefined {
  const start = Math.max(period.start.getTime(), bounds.start.getTime());
  const end = Math.min(period.end.getTime(), bounds.end.getTime());

  if (start > end) {
    return undefined;
  }

  return { end: new Date(end), start: new Date(start), unit: "custom" };
}

export { clamp };
