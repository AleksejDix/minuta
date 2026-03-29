import type { UnitHandler } from "../../types";
import {
  startOfYear,
  endOfYear,
  startOfQuarter,
  endOfQuarter,
  startOfMonth,
  endOfMonth,
  startOfDay,
  endOfDay,
  startOfHour,
  endOfHour,
  startOfMinute,
  endOfMinute,
  startOfSecond,
  endOfSecond,
  add,
  differenceInYears,
  differenceInQuarters,
  differenceInMonths,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
} from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";

function handler(
  timezone: string,
  startOfFn: (d: Date) => Date,
  endOfFn: (d: Date) => Date,
  addKey: string,
  diffFn: (a: Date, b: Date) => number
): UnitHandler {
  return {
    startOf: (date) =>
      fromZonedTime(startOfFn(toZonedTime(date, timezone)), timezone),
    endOf: (date) =>
      fromZonedTime(endOfFn(toZonedTime(date, timezone)), timezone),
    add: (date, amount) =>
      fromZonedTime(
        add(toZonedTime(date, timezone), { [addKey]: amount }),
        timezone
      ),
    diff: (from, to) =>
      diffFn(toZonedTime(to, timezone), toZonedTime(from, timezone)),
  };
}

export function createYearHandler(tz: string) {
  return handler(tz, startOfYear, endOfYear, "years", differenceInYears);
}
export function createQuarterHandler(tz: string): UnitHandler {
  return {
    startOf: (date) => fromZonedTime(startOfQuarter(toZonedTime(date, tz)), tz),
    endOf: (date) => fromZonedTime(endOfQuarter(toZonedTime(date, tz)), tz),
    add: (date, amount) =>
      fromZonedTime(add(toZonedTime(date, tz), { months: amount * 3 }), tz),
    diff: (from, to) =>
      differenceInQuarters(toZonedTime(to, tz), toZonedTime(from, tz)),
  };
}
export function createMonthHandler(tz: string) {
  return handler(tz, startOfMonth, endOfMonth, "months", differenceInMonths);
}
export function createDayHandler(tz: string) {
  return handler(tz, startOfDay, endOfDay, "days", differenceInDays);
}
// Sub-day units have fixed duration, so add/diff use UTC arithmetic.
// The toZonedTime/fromZonedTime round-trip is system-TZ-dependent for
// non-existent/ambiguous local times (DST transitions), but UTC arithmetic
// is always correct because hours/minutes/seconds are absolute units.

const HOUR_MS = 3_600_000;
const MINUTE_MS = 60_000;
const SECOND_MS = 1_000;

function subDayHandler(
  timezone: string,
  startOfFn: (d: Date) => Date,
  endOfFn: (d: Date) => Date,
  unitMs: number
): UnitHandler {
  return {
    startOf: (date) => {
      const zoned = toZonedTime(date, timezone);
      const floored = startOfFn(zoned);
      // If already at a boundary, preserve the original UTC instant.
      // The fromZonedTime round-trip can shift ambiguous times (fall back)
      // to the wrong occurrence.
      if (floored.getTime() === zoned.getTime()) return date;
      return fromZonedTime(floored, timezone);
    },
    endOf: (date) => {
      const zoned = toZonedTime(date, timezone);
      const ceiled = endOfFn(zoned);
      const result = fromZonedTime(ceiled, timezone);
      // If the result is before the input, the round-trip shifted to
      // an earlier occurrence. Compensate by adding the unit duration.
      if (result.getTime() < date.getTime())
        return new Date(result.getTime() + unitMs);
      return result;
    },
    add: (date, amount) => new Date(date.getTime() + amount * unitMs),
    diff: (from, to) => Math.trunc((to.getTime() - from.getTime()) / unitMs),
  };
}

export function createHourHandler(tz: string) {
  return subDayHandler(tz, startOfHour, endOfHour, HOUR_MS);
}
export function createMinuteHandler(tz: string) {
  return subDayHandler(tz, startOfMinute, endOfMinute, MINUTE_MS);
}
export function createSecondHandler(tz: string) {
  return subDayHandler(tz, startOfSecond, endOfSecond, SECOND_MS);
}
