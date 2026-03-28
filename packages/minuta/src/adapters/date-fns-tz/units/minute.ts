import type { UnitHandler } from "../../../types";
import { startOfMinute, endOfMinute, add, differenceInMinutes } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";

export function createMinuteHandler(timezone: string): UnitHandler {
  return {
    startOf(date: Date): Date {
      const zonedDate = toZonedTime(date, timezone);
      const startInZone = startOfMinute(zonedDate);
      return fromZonedTime(startInZone, timezone);
    },

    endOf(date: Date): Date {
      const zonedDate = toZonedTime(date, timezone);
      const endInZone = endOfMinute(zonedDate);
      return fromZonedTime(endInZone, timezone);
    },

    add(date: Date, amount: number): Date {
      const zonedDate = toZonedTime(date, timezone);
      const resultInZone = add(zonedDate, { minutes: amount });
      return fromZonedTime(resultInZone, timezone);
    },

    diff(from: Date, to: Date): number {
      const fromZoned = toZonedTime(from, timezone);
      const toZoned = toZonedTime(to, timezone);
      return differenceInMinutes(toZoned, fromZoned);
    },
  };
}
