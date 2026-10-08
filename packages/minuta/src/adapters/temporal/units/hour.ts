import type { UnitSpec } from "#src/types";
import { plainDateTimeToLocal } from "#src/adapters/temporal/to-local-date";
import { toPlainDateTime } from "#src/adapters/temporal/temporal-api";

const START_MINUTE = 0;
const START_SECOND = 0;
const START_MS = 0;
const LAST_MINUTE = 59;
const LAST_SECOND = 59;
const LAST_MS = 999;
const MS_PER_HOUR = 3_600_000;

const hourHandler: UnitSpec = {
  add(date: Readonly<Date>, amount: number): Date {
    const result = toPlainDateTime(date).add({ hours: amount });
    return plainDateTimeToLocal(result);
  },

  diff(from: Readonly<Date>, to: Readonly<Date>): number {
    const diffInMs = to.getTime() - from.getTime();
    return Math.floor(diffInMs / MS_PER_HOUR);
  },

  endOf(date: Readonly<Date>): Date {
    const result = new Date(date);
    result.setMinutes(LAST_MINUTE, LAST_SECOND, LAST_MS);
    return result;
  },

  startOf(date: Readonly<Date>): Date {
    const result = new Date(date);
    result.setMinutes(START_MINUTE, START_SECOND, START_MS);
    return result;
  },
};

export { hourHandler };
