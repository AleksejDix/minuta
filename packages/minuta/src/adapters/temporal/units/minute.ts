import type { UnitHandler } from "#src/types";
import { plainDateTimeToLocal } from "#src/adapters/temporal/to-local-date";
import { toPlainDateTime } from "#src/adapters/temporal/temporal-api";

const START_SECOND = 0;
const START_MS = 0;
const LAST_SECOND = 59;
const LAST_MS = 999;
const MS_PER_MINUTE = 60_000;

const minuteHandler: UnitHandler = {
  add(date: Readonly<Date>, amount: number): Date {
    const result = toPlainDateTime(date).add({ minutes: amount });
    return plainDateTimeToLocal(result);
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
