import { plainDateToLocal, timeOf } from "#src/adapters/temporal/to-local-date";
import type { UnitSpec } from "#src/types";
import { toPlainDate } from "#src/adapters/temporal/temporal-api";

const JANUARY = 0;
const DECEMBER = 12;
const FIRST_DAY = 1;
const LAST_DAY_OF_DECEMBER = 31;
const START_HOUR = 0;
const START_MINUTE = 0;
const START_SECOND = 0;
const START_MS = 0;
const END_OF_DAY = {
  hour: 23,
  millisecond: 999,
  minute: 59,
  second: 59,
} as const;

const yearHandler: UnitSpec = {
  add(date: Readonly<Date>, amount: number): Date {
    const result = toPlainDate(date).add({ years: amount });
    return plainDateToLocal(result, timeOf(date));
  },

  diff(from: Readonly<Date>, to: Readonly<Date>): number {
    const duration = toPlainDate(from).until(toPlainDate(to), {
      largestUnit: "year",
    });
    return duration.years;
  },

  endOf(date: Readonly<Date>): Date {
    const endOfYear = toPlainDate(date).with({
      day: LAST_DAY_OF_DECEMBER,
      month: DECEMBER,
    });
    return plainDateToLocal(endOfYear, END_OF_DAY);
  },

  startOf(date: Readonly<Date>): Date {
    return new Date(
      date.getFullYear(),
      JANUARY,
      FIRST_DAY,
      START_HOUR,
      START_MINUTE,
      START_SECOND,
      START_MS
    );
  },
};

export { yearHandler };
