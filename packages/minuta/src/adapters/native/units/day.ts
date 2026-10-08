import type { UnitSpec } from "#src/types";

const START_HOUR = 0;
const START_MINUTE = 0;
const START_SECOND = 0;
const START_MS = 0;
const LAST_HOUR = 23;
const LAST_MINUTE = 59;
const LAST_SECOND = 59;
const LAST_MS = 999;
const MS_PER_DAY = 86_400_000;

/**
 * Day unit handler - pure functional implementation
 */
const dayHandler: UnitSpec = {
  add: (date: Readonly<Date>, amount: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + amount);
    return result;
  },

  diff: (from: Readonly<Date>, to: Readonly<Date>): number => {
    const fromStart = new Date(
      from.getFullYear(),
      from.getMonth(),
      from.getDate()
    );
    const toStart = new Date(to.getFullYear(), to.getMonth(), to.getDate());
    const diffMs = toStart.getTime() - fromStart.getTime();
    return Math.floor(diffMs / MS_PER_DAY);
  },

  endOf: (date: Readonly<Date>): Date =>
    new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      LAST_HOUR,
      LAST_MINUTE,
      LAST_SECOND,
      LAST_MS
    ),

  startOf: (date: Readonly<Date>): Date =>
    new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      START_HOUR,
      START_MINUTE,
      START_SECOND,
      START_MS
    ),
};

export { dayHandler };
