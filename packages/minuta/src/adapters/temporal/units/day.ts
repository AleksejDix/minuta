import { plainDateToLocal, timeOf } from "#src/adapters/temporal/to-local-date";
import type { UnitHandler } from "#src/types";
import { toPlainDate } from "#src/adapters/temporal/temporal-api";

const START_HOUR = 0;
const START_MINUTE = 0;
const START_SECOND = 0;
const START_MS = 0;
const LAST_HOUR = 23;
const LAST_MINUTE = 59;
const LAST_SECOND = 59;
const LAST_MS = 999;

const dayHandler: UnitHandler = {
  add(date: Readonly<Date>, amount: number): Date {
    const result = toPlainDate(date).add({ days: amount });
    return plainDateToLocal(result, timeOf(date));
  },

  diff(from: Readonly<Date>, to: Readonly<Date>): number {
    const duration = toPlainDate(from).until(toPlainDate(to), {
      largestUnit: "day",
    });
    return duration.days;
  },

  endOf(date: Readonly<Date>): Date {
    const result = new Date(date);
    result.setHours(LAST_HOUR, LAST_MINUTE, LAST_SECOND, LAST_MS);
    return result;
  },

  startOf(date: Readonly<Date>): Date {
    const result = new Date(date);
    result.setHours(START_HOUR, START_MINUTE, START_SECOND, START_MS);
    return result;
  },
};

export { dayHandler };
