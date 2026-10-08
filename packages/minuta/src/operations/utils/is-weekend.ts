import type { Period } from "#src/types";

const MS_PER_DAY = 86_400_000;
const MAX_SPAN_DAYS = 2;
const TWO_DAYS_MS = MAX_SPAN_DAYS * MS_PER_DAY;
const SUNDAY = 0;
const SATURDAY = 6;

function isWeekendIndex(day: number): boolean {
  return day === SUNDAY || day === SATURDAY;
}

/**
 * Checks if a period falls entirely within a weekend.
 * Returns false for periods spanning more than 2 days.
 *
 * @param period - The period to check
 * @returns True when both start and end fall on Saturday or Sunday
 */
function isWeekend(period: Period): boolean {
  // A weekend is at most 2 days (Sat+Sun). Any longer period spans weekdays too.
  if (period.end.getTime() - period.start.getTime() >= TWO_DAYS_MS) {
    return false;
  }

  return (
    isWeekendIndex(period.start.getDay()) && isWeekendIndex(period.end.getDay())
  );
}

export { isWeekend };
