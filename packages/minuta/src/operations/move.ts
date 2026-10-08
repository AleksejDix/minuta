import type { Period, ReadonlyPeriod } from "#src/types";

/**
 * Relocate a period to a target date, preserving its duration.
 *
 * @param period - The period to relocate
 * @param targetDate - The new start date
 * @returns A custom period starting at the target date with the same duration
 *
 * @example
 * const appointment = createPeriod(new Date(2026, 2, 29, 9, 0), new Date(2026, 2, 29, 10, 0))
 * const relocated = move(appointment, new Date(2026, 3, 2, 14, 0))
 * // → { start: Apr 2 14:00, end: Apr 2 15:00, type: "custom" }
 */
function move(period: ReadonlyPeriod, targetDate: Readonly<Date>): Period {
  const durationMs = period.end.getTime() - period.start.getTime();
  return {
    end: new Date(targetDate.getTime() + durationMs),
    start: targetDate,
    type: "custom",
  };
}

export { move };
