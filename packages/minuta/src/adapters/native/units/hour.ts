import type { UnitSpec } from "#src/types";

const START_MINUTE = 0;
const START_SECOND = 0;
const START_MS = 0;
const LAST_MINUTE = 59;
const LAST_SECOND = 59;
const LAST_MS = 999;
const MS_PER_HOUR = 3_600_000;

/**
 * Hour unit handler - pure functional implementation
 */
const hourHandler: UnitSpec = {
  add: (date: Readonly<Date>, amount: number): Date => {
    const result = new Date(date);
    result.setHours(result.getHours() + amount);
    return result;
  },

  diff: (from: Readonly<Date>, to: Readonly<Date>): number => {
    const diffMs = to.getTime() - from.getTime();
    return Math.floor(diffMs / MS_PER_HOUR);
  },

  endOf: (date: Readonly<Date>): Date =>
    new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      LAST_MINUTE,
      LAST_SECOND,
      LAST_MS
    ),

  startOf: (date: Readonly<Date>): Date =>
    new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      START_MINUTE,
      START_SECOND,
      START_MS
    ),
};

export { hourHandler };
