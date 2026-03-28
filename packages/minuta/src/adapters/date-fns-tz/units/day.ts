import type { UnitHandler } from "../../../types";
import { startOfDay, endOfDay, add, differenceInDays } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";

export function createDayHandler(timezone: string): UnitHandler {
  return {
    startOf(date: Date): Date {
      // Convert to timezone, apply operation, convert back to UTC
      const zonedDate = toZonedTime(date, timezone);
      const startInZone = startOfDay(zonedDate);
      return fromZonedTime(startInZone, timezone);
    },

    endOf(date: Date): Date {
      const zonedDate = toZonedTime(date, timezone);
      const endInZone = endOfDay(zonedDate);
      return fromZonedTime(endInZone, timezone);
    },

    add(date: Date, amount: number): Date {
      const zonedDate = toZonedTime(date, timezone);
      const resultInZone = add(zonedDate, { days: amount });
      return fromZonedTime(resultInZone, timezone);
    },

    diff(from: Date, to: Date): number {
      const fromZoned = toZonedTime(from, timezone);
      const toZoned = toZonedTime(to, timezone);
      return differenceInDays(toZoned, fromZoned);
    },
  };
}
