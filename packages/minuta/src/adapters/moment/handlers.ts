import type { UnitHandler } from "../../types";
import moment, { type unitOfTime } from "moment";

function handler(
  startEndUnit: unitOfTime.StartOf,
  addUnit: unitOfTime.DurationConstructor,
  diffUnit: unitOfTime.Diff
): UnitHandler {
  return {
    startOf: (date) => moment(date).startOf(startEndUnit).toDate(),
    endOf: (date) => moment(date).endOf(startEndUnit).toDate(),
    add: (date, amount) => moment(date).add(amount, addUnit).toDate(),
    diff: (from, to) => moment(to).diff(moment(from), diffUnit),
  };
}

export function createWeekHandler(weekStartsOn: number): UnitHandler {
  const base = handler("week", "weeks", "weeks");
  return {
    startOf: (date) => {
      const m = moment(date);
      const day = m.day();
      const diff = (day - weekStartsOn + 7) % 7;
      return m.subtract(diff, "days").startOf("day").toDate();
    },
    endOf: (date) => {
      const m = moment(date);
      const day = m.day();
      const diff = (day - weekStartsOn + 7) % 7;
      return m.subtract(diff, "days").add(6, "days").endOf("day").toDate();
    },
    add: base.add,
    diff: base.diff,
  };
}

export const yearHandler = handler("year", "years", "years");
export const quarterHandler = handler("quarter", "quarters", "quarters");
export const monthHandler = handler("month", "months", "months");
export const dayHandler = handler("day", "days", "days");
export const hourHandler = handler("hour", "hours", "hours");
export const minuteHandler = handler("minute", "minutes", "minutes");
export const secondHandler = handler("second", "seconds", "seconds");
