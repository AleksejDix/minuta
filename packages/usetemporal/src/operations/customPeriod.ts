import type { TimePeriod } from "../types";

/**
 * Shift a custom period by a number of steps, preserving its duration.
 * Duration is calculated as inclusive milliseconds (end - start + 1).
 */
export function shiftCustomPeriod(p: TimePeriod, steps: number): TimePeriod {
  const duration = p.end.getTime() - p.start.getTime() + 1;
  const newStart = new Date(p.start.getTime() + duration * steps);
  const newEnd = new Date(newStart.getTime() + duration - 1);
  return {
    start: newStart,
    end: newEnd,
    type: p.type,
  };
}
