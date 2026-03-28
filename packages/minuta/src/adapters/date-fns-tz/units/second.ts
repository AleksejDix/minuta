import type { UnitHandler } from "../../../types";
import { startOfSecond, endOfSecond, add, differenceInSeconds } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";

export function createSecondHandler(timezone: string): UnitHandler {
  return {
    startOf(date: Date): Date {
      const zonedDate = toZonedTime(date, timezone);
      const startInZone = startOfSecond(zonedDate);
      return fromZonedTime(startInZone, timezone);
    },

    endOf(date: Date): Date {
      const zonedDate = toZonedTime(date, timezone);
      const endInZone = endOfSecond(zonedDate);
      return fromZonedTime(endInZone, timezone);
    },

    add(date: Date, amount: number): Date {
      const zonedDate = toZonedTime(date, timezone);
      const resultInZone = add(zonedDate, { seconds: amount });
      return fromZonedTime(resultInZone, timezone);
    },

    diff(from: Date, to: Date): number {
      const fromZoned = toZonedTime(from, timezone);
      const toZoned = toZonedTime(to, timezone);
      return differenceInSeconds(toZoned, fromZoned);
    },
  };
}
