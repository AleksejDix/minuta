import type { TimePeriod } from "../types";

/**
 * Relocate a period to a target date, preserving its duration.
 *
 * @example
 * const appointment = createPeriod(new Date(2026, 2, 29, 9, 0), new Date(2026, 2, 29, 10, 0))
 * const relocated = moveTo(appointment, new Date(2026, 3, 2, 14, 0))
 * // → { start: Apr 2 14:00, end: Apr 2 15:00, type: "custom" }
 */
export function moveTo(period: TimePeriod, targetDate: Date): TimePeriod {
  const durationMs = period.end.getTime() - period.start.getTime();
  return {
    start: targetDate,
    end: new Date(targetDate.getTime() + durationMs),
    type: "custom",
  };
}
