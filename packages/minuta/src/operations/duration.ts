import type { Period } from "../types";

/**
 * Get the duration of a period in milliseconds, or in complete units.
 *
 * @example
 * duration(meeting)            // 5400000 (ms)
 * duration(meeting, 'hour')    // 1 (complete hours)
 * duration(meeting, 'minute')  // 90
 */
export function duration(period: Period): number;
export function duration(period: Period, unit: "hour"): number;
export function duration(period: Period, unit: "minute"): number;
export function duration(period: Period, unit: "second"): number;
export function duration(period: Period, unit: "day"): number;
export function duration(
  period: Period,
  unit?: "day" | "hour" | "minute" | "second"
): number {
  const ms = period.end.getTime() - period.start.getTime();
  if (!unit) return ms;

  const divisors = {
    day: 86_400_000,
    hour: 3_600_000,
    minute: 60_000,
    second: 1_000,
  };

  return Math.trunc(ms / divisors[unit]);
}
