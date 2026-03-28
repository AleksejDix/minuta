import type { UnitHandler } from "../../../types";
import { startOfMonth, endOfMonth, add, differenceInMonths } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";

export function createMonthHandler(timezone: string): UnitHandler {
  return {
    startOf(date: Date): Date {
      const zonedDate = toZonedTime(date, timezone);
      const startInZone = startOfMonth(zonedDate);
      return fromZonedTime(startInZone, timezone);
    },

    endOf(date: Date): Date {
      const zonedDate = toZonedTime(date, timezone);
      const endInZone = endOfMonth(zonedDate);
      return fromZonedTime(endInZone, timezone);
    },

    add(date: Date, amount: number): Date {
      const zonedDate = toZonedTime(date, timezone);
      const resultInZone = add(zonedDate, { months: amount });
      return fromZonedTime(resultInZone, timezone);
    },

    diff(from: Date, to: Date): number {
      const fromZoned = toZonedTime(from, timezone);
      const toZoned = toZonedTime(to, timezone);
      return differenceInMonths(toZoned, fromZoned);
    },
  };
}
