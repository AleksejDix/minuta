import type { TimePeriod } from "../../types";

const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;

/**
 * Checks if a period falls entirely within weekdays.
 * Returns false for periods spanning more than 2 days.
 */
export function isWeekday(p: TimePeriod): boolean {
  // Weekday stretch is at most Mon-Fri (5 days). We use 2-day threshold because
  // any period crossing a day boundary into a weekend would fail the day-of-week check.
  if (p.end.getTime() - p.start.getTime() >= TWO_DAYS_MS) return false;

  const startDay = p.start.getDay();
  const endDay = p.end.getDay();
  return startDay >= 1 && startDay <= 5 && endDay >= 1 && endDay <= 5;
}
