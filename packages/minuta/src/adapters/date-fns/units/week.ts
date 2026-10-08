import { add, differenceInWeeks, endOfWeek, startOfWeek } from "date-fns";
import type { Day } from "date-fns";
import type { UnitHandler } from "#src/types";

const MONDAY = 1;

function createWeekHandler(weekStartsOn: Day = MONDAY): UnitHandler {
  return {
    add(date: Readonly<Date>, amount: number): Date {
      return add(date, { weeks: amount });
    },

    diff(from: Readonly<Date>, to: Readonly<Date>): number {
      return differenceInWeeks(to, from);
    },

    endOf(date: Readonly<Date>): Date {
      return endOfWeek(date, { weekStartsOn });
    },

    startOf(date: Readonly<Date>): Date {
      return startOfWeek(date, { weekStartsOn });
    },
  };
}

export { createWeekHandler };
