import type { UnitHandler } from "#src/types";

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
const MONTHS_PER_YEAR = 12;

/**
 * Month unit handler - pure functional implementation
 */
const monthHandler: UnitHandler = {
  add: (date: Readonly<Date>, amount: number): Date => {
    const result = new Date(date);
    const targetMonth = result.getMonth() + amount;
    const originalDay = result.getDate();

    // Set to the first day to avoid month overflow issues
    result.setDate(FIRST_DAY);
    result.setMonth(targetMonth);

    // Try to restore the original day, handling month-end edge cases
    const lastDayOfMonth = new Date(
      result.getFullYear(),
      result.getMonth() + NEXT_MONTH_OFFSET,
      LAST_DAY_OF_PREVIOUS_MONTH
    ).getDate();
    result.setDate(Math.min(originalDay, lastDayOfMonth));

    return result;
  },

  diff: (from: Readonly<Date>, to: Readonly<Date>): number =>
    (to.getFullYear() - from.getFullYear()) * MONTHS_PER_YEAR +
    (to.getMonth() - from.getMonth()),

  // Get last day of month by going to next month's day 0
  endOf: (date: Readonly<Date>): Date =>
    new Date(
      date.getFullYear(),
      date.getMonth() + NEXT_MONTH_OFFSET,
      LAST_DAY_OF_PREVIOUS_MONTH,
      LAST_HOUR,
      LAST_MINUTE,
      LAST_SECOND,
      LAST_MS
    ),

  startOf: (date: Readonly<Date>): Date =>
    new Date(
      date.getFullYear(),
      date.getMonth(),
      FIRST_DAY,
      START_HOUR,
      START_MINUTE,
      START_SECOND,
      START_MS
    ),
};

export { monthHandler };
