import type { UnitSpec } from "#src/types";

const MONTHS_PER_QUARTER = 3;
const QUARTERS_PER_YEAR = 4;
const FIRST_DAY = 1;
const LAST_DAY_OF_PREVIOUS_MONTH = 0;
const NEXT_MONTH_OFFSET = 1;
const START_HOUR = 0;
const START_MINUTE = 0;
const START_SECOND = 0;
const START_MS = 0;
const LAST_HOUR = 23;
const LAST_MINUTE = 59;
const LAST_SECOND = 59;
const LAST_MS = 999;

function quarterStartMonth(date: Readonly<Date>): number {
  return Math.floor(date.getMonth() / MONTHS_PER_QUARTER) * MONTHS_PER_QUARTER;
}

/**
 * Quarter unit handler - pure functional implementation
 */
const quarterHandler: UnitSpec = {
  add: (date: Readonly<Date>, amount: number): Date => {
    const result = new Date(date);
    const originalDay = result.getDate();

    // Set to day 1 first to prevent month overflow
    // (e.g. Jan 31 + 1 quarter → Apr 31 → May 1)
    result.setDate(FIRST_DAY);
    result.setMonth(result.getMonth() + amount * MONTHS_PER_QUARTER);

    // Restore original day, clamped to last day of target month
    const lastDayOfMonth = new Date(
      result.getFullYear(),
      result.getMonth() + NEXT_MONTH_OFFSET,
      LAST_DAY_OF_PREVIOUS_MONTH
    ).getDate();
    result.setDate(Math.min(originalDay, lastDayOfMonth));

    return result;
  },

  diff: (from: Readonly<Date>, to: Readonly<Date>): number => {
    const fromQuarter = Math.floor(from.getMonth() / MONTHS_PER_QUARTER);
    const toQuarter = Math.floor(to.getMonth() / MONTHS_PER_QUARTER);
    const yearDiff = to.getFullYear() - from.getFullYear();
    return yearDiff * QUARTERS_PER_YEAR + (toQuarter - fromQuarter);
  },

  // Get last day of quarter by going to the month after the quarter, day 0
  endOf: (date: Readonly<Date>): Date =>
    new Date(
      date.getFullYear(),
      quarterStartMonth(date) + MONTHS_PER_QUARTER,
      LAST_DAY_OF_PREVIOUS_MONTH,
      LAST_HOUR,
      LAST_MINUTE,
      LAST_SECOND,
      LAST_MS
    ),

  startOf: (date: Readonly<Date>): Date =>
    new Date(
      date.getFullYear(),
      quarterStartMonth(date),
      FIRST_DAY,
      START_HOUR,
      START_MINUTE,
      START_SECOND,
      START_MS
    ),
};

export { quarterHandler };
