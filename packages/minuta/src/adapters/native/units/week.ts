import type { UnitSpec } from "#src/types";

const DAYS_PER_WEEK = 7;
const LAST_DAY_OF_WEEK_OFFSET = 6;
const START_HOUR = 0;
const START_MINUTE = 0;
const START_SECOND = 0;
const START_MS = 0;
const LAST_HOUR = 23;
const LAST_MINUTE = 59;
const LAST_SECOND = 59;
const LAST_MS = 999;
const MS_PER_WEEK = 604_800_000;
const SUNDAY = 0;
const MONDAY = 1;
const TUESDAY = 2;
const WEDNESDAY = 3;
const THURSDAY = 4;
const FRIDAY = 5;
const SATURDAY = 6;

type WeekStartsOn =
  | typeof SUNDAY
  | typeof MONDAY
  | typeof TUESDAY
  | typeof WEDNESDAY
  | typeof THURSDAY
  | typeof FRIDAY
  | typeof SATURDAY;

function daysSinceWeekStart(
  date: Readonly<Date>,
  weekStartsOn: WeekStartsOn
): number {
  return (date.getDay() - weekStartsOn + DAYS_PER_WEEK) % DAYS_PER_WEEK;
}

/**
 * Create week unit handler with configurable week start day
 * @param weekStartsOn - Day the week starts on (0 = Sunday, 1 = Monday, ...)
 * @returns The week unit handler
 */
function createWeekHandler(weekStartsOn: WeekStartsOn = MONDAY): UnitSpec {
  return {
    add: (date: Readonly<Date>, amount: number): Date => {
      const result = new Date(date);
      result.setDate(result.getDate() + amount * DAYS_PER_WEEK);
      return result;
    },

    diff: (from: Readonly<Date>, to: Readonly<Date>): number => {
      const diffMs = to.getTime() - from.getTime();
      return Math.floor(diffMs / MS_PER_WEEK);
    },

    endOf: (date: Readonly<Date>): Date => {
      const result = new Date(date);
      result.setDate(
        result.getDate() -
          daysSinceWeekStart(result, weekStartsOn) +
          LAST_DAY_OF_WEEK_OFFSET
      );
      result.setHours(LAST_HOUR, LAST_MINUTE, LAST_SECOND, LAST_MS);
      return result;
    },

    startOf: (date: Readonly<Date>): Date => {
      const result = new Date(date);
      result.setDate(
        result.getDate() - daysSinceWeekStart(result, weekStartsOn)
      );
      result.setHours(START_HOUR, START_MINUTE, START_SECOND, START_MS);
      return result;
    },
  };
}

export { createWeekHandler };
export type { WeekStartsOn };
