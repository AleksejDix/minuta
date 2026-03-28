import type { UnitHandler } from "../../../types";
import {
  startOfQuarter,
  endOfQuarter,
  add,
  differenceInQuarters,
} from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";

export function createQuarterHandler(timezone: string): UnitHandler {
  return {
    startOf(date: Date): Date {
      const zonedDate = toZonedTime(date, timezone);
      const startInZone = startOfQuarter(zonedDate);
      return fromZonedTime(startInZone, timezone);
    },

    endOf(date: Date): Date {
      const zonedDate = toZonedTime(date, timezone);
      const endInZone = endOfQuarter(zonedDate);
      return fromZonedTime(endInZone, timezone);
    },

    add(date: Date, amount: number): Date {
      const zonedDate = toZonedTime(date, timezone);
      const resultInZone = add(zonedDate, { months: amount * 3 });
      return fromZonedTime(resultInZone, timezone);
    },

    diff(from: Date, to: Date): number {
      const fromZoned = toZonedTime(from, timezone);
      const toZoned = toZonedTime(to, timezone);
      return differenceInQuarters(toZoned, fromZoned);
    },
  };
}
