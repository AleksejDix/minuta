import { add, differenceInWeeks, endOfWeek, startOfWeek } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import type { Day } from "date-fns";
import type { UnitHandler } from "#src/types";

function createWeekHandler(timezone: string, weekStartsOn: Day): UnitHandler {
  return {
    add(date: Readonly<Date>, amount: number): Date {
      const zonedDate = toZonedTime(date, timezone);
      const resultInZone = add(zonedDate, { weeks: amount });
      return fromZonedTime(resultInZone, timezone);
    },

    diff(from: Readonly<Date>, to: Readonly<Date>): number {
      const fromZoned = toZonedTime(from, timezone);
      const toZoned = toZonedTime(to, timezone);
      return differenceInWeeks(toZoned, fromZoned);
    },

    endOf(date: Readonly<Date>): Date {
      const zonedDate = toZonedTime(date, timezone);
      const endInZone = endOfWeek(zonedDate, { weekStartsOn });
      return fromZonedTime(endInZone, timezone);
    },

    startOf(date: Readonly<Date>): Date {
      const zonedDate = toZonedTime(date, timezone);
      const startInZone = startOfWeek(zonedDate, { weekStartsOn });
      return fromZonedTime(startInZone, timezone);
    },
  };
}

export { createWeekHandler };
