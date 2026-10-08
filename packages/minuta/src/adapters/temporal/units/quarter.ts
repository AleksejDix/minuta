import { getTemporal, toPlainDate } from "#src/adapters/temporal/temporal-api";
import { plainDateToLocal, timeOf } from "#src/adapters/temporal/to-local-date";
import type { UnitSpec } from "#src/types";

const MONTHS_PER_QUARTER = 3;
const LAST_MONTH_OF_QUARTER_OFFSET = 2;
const FIRST_DAY = 1;
const MONTH_INDEX_OFFSET = 1;
const START_HOUR = 0;
const START_MINUTE = 0;
const START_SECOND = 0;
const START_MS = 0;
const LAST_HOUR = 23;
const LAST_MINUTE = 59;
const LAST_SECOND = 59;
const LAST_MS = 999;

function quarterStartMonth(date: Readonly<Date>): number {
  return Math.floor(date.getMonth() / MONTHS_PER_QUARTER) * MONTHS_PER_QUARTER;
}

const quarterHandler: UnitSpec = {
  add(date: Readonly<Date>, amount: number): Date {
    const result = toPlainDate(date).add({
      months: amount * MONTHS_PER_QUARTER,
    });
    return plainDateToLocal(result, timeOf(date));
  },

  diff(from: Readonly<Date>, to: Readonly<Date>): number {
    const duration = toPlainDate(from).until(toPlainDate(to), {
      largestUnit: "month",
    });
    return Math.floor(duration.months / MONTHS_PER_QUARTER);
  },

  endOf(date: Readonly<Date>): Date {
    const quarterEndMonth =
      quarterStartMonth(date) + LAST_MONTH_OF_QUARTER_OFFSET;
    const plainDate = getTemporal().PlainDate.from({
      day: FIRST_DAY,
      month: quarterEndMonth + MONTH_INDEX_OFFSET,
      year: date.getFullYear(),
    });
    const lastDay = plainDate.daysInMonth;
    const result = new Date(date.getFullYear(), quarterEndMonth, lastDay);
    result.setHours(LAST_HOUR, LAST_MINUTE, LAST_SECOND, LAST_MS);
    return result;
  },

  startOf(date: Readonly<Date>): Date {
    const result = new Date(
      date.getFullYear(),
      quarterStartMonth(date),
      FIRST_DAY
    );
    result.setHours(START_HOUR, START_MINUTE, START_SECOND, START_MS);
    return result;
  },
};

export { quarterHandler };
