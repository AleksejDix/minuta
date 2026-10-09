import type { UnitSpec } from "#src/types";

const START_MS = 0;
const LAST_MS = 999;
const MS_PER_SECOND = 1000;

const secondHandler: UnitSpec = {
  // Elapsed time, so DST changes neither skip nor repeat a step
  add(date: Readonly<Date>, amount: number): Date {
    return new Date(date.getTime() + amount * MS_PER_SECOND);
  },

  diff(from: Readonly<Date>, to: Readonly<Date>): number {
    const diffInMs = to.getTime() - from.getTime();
    return Math.floor(diffInMs / MS_PER_SECOND);
  },

  endOf(date: Readonly<Date>): Date {
    const result = new Date(date);
    result.setMilliseconds(LAST_MS);
    return result;
  },

  startOf(date: Readonly<Date>): Date {
    const result = new Date(date);
    result.setMilliseconds(START_MS);
    return result;
  },
};

export { secondHandler };
