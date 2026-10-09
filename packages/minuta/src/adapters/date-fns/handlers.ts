import {
  add,
  differenceInDays,
  differenceInMonths,
  differenceInQuarters,
  differenceInYears,
  endOfDay,
  endOfMonth,
  endOfQuarter,
  endOfYear,
  startOfDay,
  startOfMonth,
  startOfQuarter,
  startOfYear,
} from "date-fns";
import {
  elapsedHour,
  elapsedMinute,
  elapsedSecond,
} from "#src/adapters/elapsed-units";
import type { Duration } from "date-fns";
import type { UnitSpec } from "#src/types";

const MONTHS_PER_QUARTER = 3;

type HandlerParts = Readonly<{
  startOf: (date: Readonly<Date>) => Date;
  endOf: (date: Readonly<Date>) => Date;
  addKey: keyof Duration;
  diffFn: (later: Readonly<Date>, earlier: Readonly<Date>) => number;
}>;

function handler(parts: HandlerParts): UnitSpec {
  return {
    add: (date: Readonly<Date>, amount: number): Date =>
      add(date, { [parts.addKey]: amount }),
    diff: (from: Readonly<Date>, to: Readonly<Date>): number =>
      parts.diffFn(to, from),
    endOf: (date: Readonly<Date>): Date => parts.endOf(date),
    startOf: (date: Readonly<Date>): Date => parts.startOf(date),
  };
}

const yearHandler: UnitSpec = handler({
  addKey: "years",
  diffFn: differenceInYears,
  endOf: endOfYear,
  startOf: startOfYear,
});
const quarterHandler: UnitSpec = {
  add: (date: Readonly<Date>, amount: number): Date =>
    add(date, { months: amount * MONTHS_PER_QUARTER }),
  diff: (from: Readonly<Date>, to: Readonly<Date>): number =>
    differenceInQuarters(to, from),
  endOf: (date: Readonly<Date>): Date => endOfQuarter(date),
  startOf: (date: Readonly<Date>): Date => startOfQuarter(date),
};
const monthHandler: UnitSpec = handler({
  addKey: "months",
  diffFn: differenceInMonths,
  endOf: endOfMonth,
  startOf: startOfMonth,
});
const dayHandler: UnitSpec = handler({
  addKey: "days",
  diffFn: differenceInDays,
  endOf: endOfDay,
  startOf: startOfDay,
});
const hourHandler: UnitSpec = elapsedHour;
const minuteHandler: UnitSpec = elapsedMinute;
const secondHandler: UnitSpec = elapsedSecond;

export {
  dayHandler,
  hourHandler,
  minuteHandler,
  monthHandler,
  quarterHandler,
  secondHandler,
  yearHandler,
};
