import type { TimePeriod } from "../types";

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
 */
export function clamp(
  period: TimePeriod,
  bounds: TimePeriod
): TimePeriod | null {
  const start = Math.max(period.start.getTime(), bounds.start.getTime());
  const end = Math.min(period.end.getTime(), bounds.end.getTime());

  if (start > end) return null;

  return { start: new Date(start), end: new Date(end), type: "custom" };
}
