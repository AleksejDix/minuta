import type { UnitSpec } from "#src/types";

const START_SECOND = 0;
const START_MS = 0;
const LAST_SECOND = 59;
const LAST_MS = 999;
const MS_PER_MINUTE = 60_000;

const minuteHandler: UnitSpec = {
  // Elapsed time, so DST changes neither skip nor repeat a step
  add(date: Readonly<Date>, amount: number): Date {
    return new Date(date.getTime() + amount * MS_PER_MINUTE);
  },

  diff(from: Readonly<Date>, to: Readonly<Date>): number {
    const diffInMs = to.getTime() - from.getTime();
    return Math.floor(diffInMs / MS_PER_MINUTE);
  },

  endOf(date: Readonly<Date>): Date {
    const result = new Date(date);
    result.setSeconds(LAST_SECOND, LAST_MS);
    return result;
  },

  startOf(date: Readonly<Date>): Date {
    const result = new Date(date);
    result.setSeconds(START_SECOND, START_MS);
    return result;
  },
};

export { minuteHandler };
