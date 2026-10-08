import { DateTime } from "luxon";
import type { UnitSpec } from "#src/types";

type LuxonUnit =
  | "years"
  | "quarters"
  | "months"
  | "days"
  | "hours"
  | "minutes"
  | "seconds";
type LuxonStartOf =
  | "year"
  | "quarter"
  | "month"
  | "day"
  | "hour"
  | "minute"
  | "second";

function handler(
  unit: LuxonStartOf,
  addKey: LuxonUnit,
  diffKey: LuxonUnit
): UnitSpec {
  return {
    add: (date: Readonly<Date>, amount: number): Date =>
      DateTime.fromJSDate(date)
        .plus({ [addKey]: amount })
        .toJSDate(),
    diff: (from: Readonly<Date>, to: Readonly<Date>): number => {
      const start = DateTime.fromJSDate(from);
      const end = DateTime.fromJSDate(to);
      return Math.floor(end.diff(start, diffKey)[diffKey]);
    },
    endOf: (date: Readonly<Date>): Date =>
      DateTime.fromJSDate(date).endOf(unit).toJSDate(),
    startOf: (date: Readonly<Date>): Date =>
      DateTime.fromJSDate(date).startOf(unit).toJSDate(),
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
  dayHandler,
  hourHandler,
  minuteHandler,
  monthHandler,
  quarterHandler,
  secondHandler,
  yearHandler,
};
