import type { UnitSpec } from "#src/types";

const START_MS = 0;
const LAST_MS = 999;
const MS_PER_SECOND = 1000;

/**
 * Second unit handler - pure functional implementation
 */
const secondHandler: UnitSpec = {
  // Elapsed time, so DST changes neither skip nor repeat a step
  add: (date: Readonly<Date>, amount: number): Date =>
    new Date(date.getTime() + amount * MS_PER_SECOND),

  diff: (from: Readonly<Date>, to: Readonly<Date>): number => {
    const diffMs = to.getTime() - from.getTime();
    return Math.floor(diffMs / MS_PER_SECOND);
  },

  endOf: (date: Readonly<Date>): Date =>
    new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
      LAST_MS
    ),

  startOf: (date: Readonly<Date>): Date =>
    new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
      START_MS
    ),
};

export { secondHandler };
