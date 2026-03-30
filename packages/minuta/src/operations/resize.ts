import type { TimePeriod } from "../types";

/**
 * Move one edge of a period while keeping the other fixed.
 *
 * Returns null if the new edge crosses the fixed edge.
 *
 * @example
 * const meeting = createPeriod(new Date(2026, 2, 29, 9, 0), new Date(2026, 2, 29, 10, 0))
 * resize(meeting, 'end', new Date(2026, 2, 29, 11, 30))
 * // → { start: 9:00, end: 11:30, type: "custom" }
 */
export function resize(
  period: TimePeriod,
  edge: "start" | "end",
  newDate: Date
): TimePeriod | null {
  const start = edge === "start" ? newDate : period.start;
  const end = edge === "end" ? newDate : period.end;

  if (start.getTime() > end.getTime()) return null;

  return { start, end, type: "custom" };
}
