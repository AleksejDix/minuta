import type { UnitHandler } from "../../../types";
import { startOfWeek, endOfWeek, add, differenceInWeeks } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";

export function createWeekHandler(
  timezone: string,
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6
): UnitHandler {
  return {
    startOf(date: Date): Date {
      const zonedDate = toZonedTime(date, timezone);
      const startInZone = startOfWeek(zonedDate, { weekStartsOn });
      return fromZonedTime(startInZone, timezone);
    },

    endOf(date: Date): Date {
      const zonedDate = toZonedTime(date, timezone);
      const endInZone = endOfWeek(zonedDate, { weekStartsOn });
      return fromZonedTime(endInZone, timezone);
    },

    add(date: Date, amount: number): Date {
      const zonedDate = toZonedTime(date, timezone);
      const resultInZone = add(zonedDate, { weeks: amount });
      return fromZonedTime(resultInZone, timezone);
    },

    diff(from: Date, to: Date): number {
      const fromZoned = toZonedTime(from, timezone);
      const toZoned = toZonedTime(to, timezone);
      return differenceInWeeks(toZoned, fromZoned);
    },
  };
}
