import type { ReadonlyPeriod } from "#src/types";

const MS_PER_DAY = 86_400_000;
const MAX_SPAN_DAYS = 2;
const TWO_DAYS_MS = MAX_SPAN_DAYS * MS_PER_DAY;
const MONDAY = 1;
const FRIDAY = 5;

function isWeekdayIndex(day: number): boolean {
  return day >= MONDAY && day <= FRIDAY;
}

/**
 * Checks if a period falls entirely within weekdays.
 * Returns false for periods spanning more than 2 days.
 *
 * @param period - The period to check
 * @returns True when both start and end fall on Monday to Friday
 */
function isWeekday(period: ReadonlyPeriod): boolean {
  /*
   * Weekday stretch is at most Mon-Fri (5 days). We use 2-day threshold because
   * any period crossing a day boundary into a weekend would fail the day-of-week check.
   */
  if (period.end.getTime() - period.start.getTime() >= TWO_DAYS_MS) {
    return false;
  }

  return (
    isWeekdayIndex(period.start.getDay()) && isWeekdayIndex(period.end.getDay())
  );
}

export { isWeekday };
