import type { UnitHandler } from "#src/types";
import { plainDateTimeToLocal } from "#src/adapters/temporal/to-local-date";
import { toPlainDateTime } from "#src/adapters/temporal/temporal-api";

const START_MS = 0;
const LAST_MS = 999;
const MS_PER_SECOND = 1000;

const secondHandler: UnitHandler = {
  add(date: Readonly<Date>, amount: number): Date {
    const result = toPlainDateTime(date).add({ seconds: amount });
    return plainDateTimeToLocal(result);
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
