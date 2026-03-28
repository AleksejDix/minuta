import type { UnitHandler } from "../../../types";
import { startOfHour, endOfHour, add, differenceInHours } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";

export function createHourHandler(timezone: string): UnitHandler {
  return {
    startOf(date: Date): Date {
      const zonedDate = toZonedTime(date, timezone);
      const startInZone = startOfHour(zonedDate);
      return fromZonedTime(startInZone, timezone);
    },

    endOf(date: Date): Date {
      const zonedDate = toZonedTime(date, timezone);
      const endInZone = endOfHour(zonedDate);
      return fromZonedTime(endInZone, timezone);
    },

    add(date: Date, amount: number): Date {
      const zonedDate = toZonedTime(date, timezone);
      const resultInZone = add(zonedDate, { hours: amount });
      return fromZonedTime(resultInZone, timezone);
    },

    diff(from: Date, to: Date): number {
      const fromZoned = toZonedTime(from, timezone);
      const toZoned = toZonedTime(to, timezone);
      return differenceInHours(toZoned, fromZoned);
    },
  };
}
