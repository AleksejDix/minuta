import type { TimePeriod } from "../types";

/**
 * Shift a custom period by a number of steps, preserving its duration.
 * Duration is calculated as inclusive milliseconds (end - start + 1).
 */
export function shiftCustomPeriod(p: TimePeriod, steps: number): TimePeriod {
  // +1 because periods are inclusive: a period from 00:00 to 23:59:59.999
  // has a duration of 86,400,000ms (1 day), not 86,399,999ms.
  const duration = p.end.getTime() - p.start.getTime() + 1;
  const newStart = new Date(p.start.getTime() + duration * steps);
  const newEnd = new Date(newStart.getTime() + duration - 1);
  return {
    start: newStart,
    end: newEnd,
    type: p.type,
  };
}
