import {
  add,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInMonths,
  differenceInQuarters,
  differenceInSeconds,
  differenceInYears,
  endOfDay,
  endOfHour,
  endOfMinute,
  endOfMonth,
  endOfQuarter,
  endOfSecond,
  endOfYear,
  startOfDay,
  startOfHour,
  startOfMinute,
  startOfMonth,
  startOfQuarter,
  startOfSecond,
  startOfYear,
} from "date-fns";
import type { Duration } from "date-fns";
import type { UnitHandler } from "#src/types";

const MONTHS_PER_QUARTER = 3;

type HandlerParts = Readonly<{
  startOf: (date: Readonly<Date>) => Date;
  endOf: (date: Readonly<Date>) => Date;
  addKey: keyof Duration;
  diffFn: (later: Readonly<Date>, earlier: Readonly<Date>) => number;
}>;

function handler(parts: HandlerParts): UnitHandler {
  return {
    add: (date: Readonly<Date>, amount: number): Date =>
      add(date, { [parts.addKey]: amount }),
    diff: (from: Readonly<Date>, to: Readonly<Date>): number =>
      parts.diffFn(to, from),
    endOf: (date: Readonly<Date>): Date => parts.endOf(date),
    startOf: (date: Readonly<Date>): Date => parts.startOf(date),
  };
}

const yearHandler: UnitHandler = handler({
  addKey: "years",
  diffFn: differenceInYears,
  endOf: endOfYear,
  startOf: startOfYear,
});
const quarterHandler: UnitHandler = {
  add: (date: Readonly<Date>, amount: number): Date =>
    add(date, { months: amount * MONTHS_PER_QUARTER }),
  diff: (from: Readonly<Date>, to: Readonly<Date>): number =>
    differenceInQuarters(to, from),
  endOf: (date: Readonly<Date>): Date => endOfQuarter(date),
  startOf: (date: Readonly<Date>): Date => startOfQuarter(date),
};
const monthHandler: UnitHandler = handler({
  addKey: "months",
  diffFn: differenceInMonths,
  endOf: endOfMonth,
  startOf: startOfMonth,
});
const dayHandler: UnitHandler = handler({
  addKey: "days",
  diffFn: differenceInDays,
  endOf: endOfDay,
  startOf: startOfDay,
});
const hourHandler: UnitHandler = handler({
  addKey: "hours",
  diffFn: differenceInHours,
  endOf: endOfHour,
  startOf: startOfHour,
});
const minuteHandler: UnitHandler = handler({
  addKey: "minutes",
  diffFn: differenceInMinutes,
  endOf: endOfMinute,
  startOf: startOfMinute,
});
const secondHandler: UnitHandler = handler({
  addKey: "seconds",
  diffFn: differenceInSeconds,
  endOf: endOfSecond,
  startOf: startOfSecond,
});

export {
  dayHandler,
  hourHandler,
  minuteHandler,
  monthHandler,
  quarterHandler,
  secondHandler,
  yearHandler,
};
