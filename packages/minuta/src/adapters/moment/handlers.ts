import type { UnitSpec } from "#src/types";
import moment from "moment";
import type { unitOfTime } from "moment";

const DAYS_PER_WEEK = 7;
const LAST_DAY_OF_WEEK_OFFSET = 6;

function handler(
  startEndUnit: unitOfTime.StartOf,
  addUnit: unitOfTime.DurationConstructor,
  diffUnit: unitOfTime.Diff
): UnitSpec {
  return {
    add: (date: Readonly<Date>, amount: number): Date =>
      moment(date).add(amount, addUnit).toDate(),
    diff: (from: Readonly<Date>, to: Readonly<Date>): number =>
      moment(to).diff(moment(from), diffUnit),
    endOf: (date: Readonly<Date>): Date =>
      moment(date).endOf(startEndUnit).toDate(),
    startOf: (date: Readonly<Date>): Date =>
      moment(date).startOf(startEndUnit).toDate(),
  };
}

function createWeekHandler(weekStartsOn: number): UnitSpec {
  const base = handler("week", "weeks", "weeks");
  return {
    add: (date: Readonly<Date>, amount: number): Date => base.add(date, amount),
    diff: (from: Readonly<Date>, to: Readonly<Date>): number =>
      base.diff(from, to),
    endOf: (date: Readonly<Date>): Date => {
      const current = moment(date);
      const diff =
        (current.day() - weekStartsOn + DAYS_PER_WEEK) % DAYS_PER_WEEK;
      return current
        .subtract(diff, "days")
        .add(LAST_DAY_OF_WEEK_OFFSET, "days")
        .endOf("day")
        .toDate();
    },
    startOf: (date: Readonly<Date>): Date => {
      const current = moment(date);
      const diff =
        (current.day() - weekStartsOn + DAYS_PER_WEEK) % DAYS_PER_WEEK;
      return current.subtract(diff, "days").startOf("day").toDate();
    },
  };
}

const yearHandler: UnitSpec = handler("year", "years", "years");
const quarterHandler: UnitSpec = handler("quarter", "quarters", "quarters");
const monthHandler: UnitSpec = handler("month", "months", "months");
const dayHandler: UnitSpec = handler("day", "days", "days");
const hourHandler: UnitSpec = handler("hour", "hours", "hours");
const minuteHandler: UnitSpec = handler("minute", "minutes", "minutes");
const secondHandler: UnitSpec = handler("second", "seconds", "seconds");

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
