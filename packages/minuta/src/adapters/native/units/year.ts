import type { UnitHandler } from "#src/types";

const JANUARY = 0;
const DECEMBER = 11;
const FIRST_DAY = 1;
const LAST_DAY_OF_DECEMBER = 31;
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

/**
 * Year unit handler - pure functional implementation
 */
const yearHandler: UnitHandler = {
  add: (date: Readonly<Date>, amount: number): Date => {
    const result = new Date(date);
    const originalDay = result.getDate();

    // Set to day 1 first to prevent month overflow during setFullYear
    // (e.g. Feb 29 in a leap year → Mar 1 in a non-leap year)
    result.setDate(FIRST_DAY);
    result.setFullYear(result.getFullYear() + amount);

    // Restore original day, clamped to last day of the target month
    const lastDayOfMonth = new Date(
      result.getFullYear(),
      result.getMonth() + NEXT_MONTH_OFFSET,
      LAST_DAY_OF_PREVIOUS_MONTH
    ).getDate();
    result.setDate(Math.min(originalDay, lastDayOfMonth));

    return result;
  },

  diff: (from: Readonly<Date>, to: Readonly<Date>): number =>
    to.getFullYear() - from.getFullYear(),

  endOf: (date: Readonly<Date>): Date =>
    new Date(
      date.getFullYear(),
      DECEMBER,
      LAST_DAY_OF_DECEMBER,
      LAST_HOUR,
      LAST_MINUTE,
      LAST_SECOND,
      LAST_MS
    ),

  startOf: (date: Readonly<Date>): Date =>
    new Date(
      date.getFullYear(),
      JANUARY,
      FIRST_DAY,
      START_HOUR,
      START_MINUTE,
      START_SECOND,
      START_MS
    ),
};

export { yearHandler };
