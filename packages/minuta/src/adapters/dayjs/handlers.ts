import type { ManipulateType, OpUnitType } from "dayjs";
import type { UnitHandler } from "#src/types";
import dayjs from "dayjs";
import quarterOfYear from "dayjs/plugin/quarterOfYear";

dayjs.extend(quarterOfYear);

const DAYS_PER_WEEK = 7;
const LAST_DAY_OF_WEEK_OFFSET = 6;
const MONTHS_PER_QUARTER = 3;

function handler(
  startEndUnit: OpUnitType,
  addUnit: ManipulateType
): UnitHandler {
  return {
    add: (date: Readonly<Date>, amount: number): Date =>
      dayjs(date).add(amount, addUnit).toDate(),
    diff: (from: Readonly<Date>, to: Readonly<Date>): number =>
      dayjs(to).diff(dayjs(from), startEndUnit),
    endOf: (date: Readonly<Date>): Date =>
      dayjs(date).endOf(startEndUnit).toDate(),
    startOf: (date: Readonly<Date>): Date =>
      dayjs(date).startOf(startEndUnit).toDate(),
  };
}

function createWeekHandler(weekStartsOn: number): UnitHandler {
  const base = handler("week", "week");
  return {
    add: (date: Readonly<Date>, amount: number): Date => base.add(date, amount),
    diff: (from: Readonly<Date>, to: Readonly<Date>): number =>
      base.diff(from, to),
    endOf: (date: Readonly<Date>): Date => {
      const current = dayjs(date);
      const diff =
        (current.day() - weekStartsOn + DAYS_PER_WEEK) % DAYS_PER_WEEK;
      return current
        .subtract(diff, "day")
        .add(LAST_DAY_OF_WEEK_OFFSET, "day")
        .endOf("day")
        .toDate();
    },
    startOf: (date: Readonly<Date>): Date => {
      const current = dayjs(date);
      const diff =
        (current.day() - weekStartsOn + DAYS_PER_WEEK) % DAYS_PER_WEEK;
      return current.subtract(diff, "day").startOf("day").toDate();
    },
  };
}

const yearHandler: UnitHandler = handler("year", "year");
const quarterHandler: UnitHandler = {
  add: (date: Readonly<Date>, amount: number): Date =>
    dayjs(date)
      .add(amount * MONTHS_PER_QUARTER, "month")
      .toDate(),
  diff: (from: Readonly<Date>, to: Readonly<Date>): number =>
    dayjs(to).diff(dayjs(from), "quarter"),
  endOf: (date: Readonly<Date>): Date => dayjs(date).endOf("quarter").toDate(),
  startOf: (date: Readonly<Date>): Date =>
    dayjs(date).startOf("quarter").toDate(),
};
const monthHandler: UnitHandler = handler("month", "month");
const dayHandler: UnitHandler = handler("day", "day");
const hourHandler: UnitHandler = handler("hour", "hour");
const minuteHandler: UnitHandler = handler("minute", "minute");
const secondHandler: UnitHandler = handler("second", "second");

export {
  createWeekHandler,
  dayHandler,
  hourHandler,
  minuteHandler,
  monthHandler,
  quarterHandler,
  secondHandler,
  yearHandler,
};
