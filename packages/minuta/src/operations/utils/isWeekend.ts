import type { TimePeriod } from "../../types";

const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;

/**
 * Checks if a period falls entirely within a weekend.
 * Returns false for periods spanning more than 2 days.
 */
export function isWeekend(p: TimePeriod): boolean {
  // A weekend is at most 2 days (Sat+Sun). Any longer period spans weekdays too.
  if (p.end.getTime() - p.start.getTime() >= TWO_DAYS_MS) return false;

  const startDay = p.start.getDay();
  const endDay = p.end.getDay();
  return (startDay === 0 || startDay === 6) && (endDay === 0 || endDay === 6);
}
