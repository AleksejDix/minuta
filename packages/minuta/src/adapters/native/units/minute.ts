import type { UnitHandler } from "#src/types";

const START_SECOND = 0;
const START_MS = 0;
const LAST_SECOND = 59;
const LAST_MS = 999;
const MS_PER_MINUTE = 60_000;

/**
 * Minute unit handler - pure functional implementation
 */
const minuteHandler: UnitHandler = {
  add: (date: Readonly<Date>, amount: number): Date => {
    const result = new Date(date);
    result.setMinutes(result.getMinutes() + amount);
    return result;
  },

  diff: (from: Readonly<Date>, to: Readonly<Date>): number => {
    const diffMs = to.getTime() - from.getTime();
    return Math.floor(diffMs / MS_PER_MINUTE);
  },

  endOf: (date: Readonly<Date>): Date =>
    new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      LAST_SECOND,
      LAST_MS
    ),

  startOf: (date: Readonly<Date>): Date =>
    new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      START_SECOND,
      START_MS
    ),
};

export { minuteHandler };
