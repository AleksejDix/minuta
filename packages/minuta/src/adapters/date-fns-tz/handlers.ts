import {
  add,
  differenceInDays,
  differenceInMonths,
  differenceInQuarters,
  differenceInYears,
  endOfDay,
  endOfHour,
  endOfMinute,
  endOfMonth,
  endOfQuarter,
  endOfSecond,
  endOfYear,
  startOfDay,
  startOfHour,
  startOfMinute,
  startOfMonth,
  startOfQuarter,
  startOfSecond,
  startOfYear,
} from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import type { Duration } from "date-fns";
import type { UnitSpec } from "#src/types";

const MONTHS_PER_QUARTER = 3;

type DateTransform = (date: Readonly<Date>) => Date;

type HandlerParts = Readonly<{
  timezone: string;
  startOfFn: DateTransform;
  endOfFn: DateTransform;
  addKey: keyof Duration;
  diffFn: (later: Readonly<Date>, earlier: Readonly<Date>) => number;
}>;

type SubDayHandlerParts = Readonly<{
  timezone: string;
  startOfFn: DateTransform;
  endOfFn: DateTransform;
  unitMs: number;
}>;

function handler(parts: HandlerParts): UnitSpec {
  const { timezone } = parts;
  return {
    add: (date: Readonly<Date>, amount: number): Date =>
      fromZonedTime(
        add(toZonedTime(date, timezone), { [parts.addKey]: amount }),
        timezone
      ),
    diff: (from: Readonly<Date>, to: Readonly<Date>): number =>
      parts.diffFn(toZonedTime(to, timezone), toZonedTime(from, timezone)),
    endOf: (date: Readonly<Date>): Date =>
      fromZonedTime(parts.endOfFn(toZonedTime(date, timezone)), timezone),
    startOf: (date: Readonly<Date>): Date =>
      fromZonedTime(parts.startOfFn(toZonedTime(date, timezone)), timezone),
  };
}

function createYearHandler(tz: string): UnitSpec {
  return handler({
    addKey: "years",
    diffFn: differenceInYears,
    endOfFn: endOfYear,
    startOfFn: startOfYear,
    timezone: tz,
  });
}
function createQuarterHandler(tz: string): UnitSpec {
  return {
    add: (date: Readonly<Date>, amount: number): Date =>
      fromZonedTime(
        add(toZonedTime(date, tz), { months: amount * MONTHS_PER_QUARTER }),
        tz
      ),
    diff: (from: Readonly<Date>, to: Readonly<Date>): number =>
      differenceInQuarters(toZonedTime(to, tz), toZonedTime(from, tz)),
    endOf: (date: Readonly<Date>): Date =>
      fromZonedTime(endOfQuarter(toZonedTime(date, tz)), tz),
    startOf: (date: Readonly<Date>): Date =>
      fromZonedTime(startOfQuarter(toZonedTime(date, tz)), tz),
  };
}
function createMonthHandler(tz: string): UnitSpec {
  return handler({
    addKey: "months",
    diffFn: differenceInMonths,
    endOfFn: endOfMonth,
    startOfFn: startOfMonth,
    timezone: tz,
  });
}
function createDayHandler(tz: string): UnitSpec {
  return handler({
    addKey: "days",
    diffFn: differenceInDays,
    endOfFn: endOfDay,
    startOfFn: startOfDay,
    timezone: tz,
  });
}
/*
 * Sub-day units have fixed duration, so add/diff use UTC arithmetic.
 * The toZonedTime/fromZonedTime round-trip is system-TZ-dependent for
 * non-existent/ambiguous local times (DST transitions), but UTC arithmetic
 * is always correct because hours/minutes/seconds are absolute units.
 */

const HOUR_MS = 3_600_000;
const MINUTE_MS = 60_000;
const SECOND_MS = 1000;

function subDayHandler(parts: SubDayHandlerParts): UnitSpec {
  const { timezone, unitMs } = parts;
  return {
    add: (date: Readonly<Date>, amount: number): Date =>
      new Date(date.getTime() + amount * unitMs),
    diff: (from: Readonly<Date>, to: Readonly<Date>): number =>
      Math.trunc((to.getTime() - from.getTime()) / unitMs),
    endOf: (date: Readonly<Date>): Date => {
      const zoned = toZonedTime(date, timezone);
      const ceiled = parts.endOfFn(zoned);
      const result = fromZonedTime(ceiled, timezone);
      /*
       * If the result is before the input, the round-trip shifted to
       * an earlier occurrence. Compensate by adding the unit duration.
       */
      if (result.getTime() < date.getTime()) {
        return new Date(result.getTime() + unitMs);
      }
      return result;
    },
    startOf: (date: Readonly<Date>): Date => {
      const zoned = toZonedTime(date, timezone);
      const floored = parts.startOfFn(zoned);
      /*
       * If already at a boundary, preserve the original UTC instant.
       * The fromZonedTime round-trip can shift ambiguous times (fall back)
       * to the wrong occurrence.
       */
      if (floored.getTime() === zoned.getTime()) {
        return date;
      }
      return fromZonedTime(floored, timezone);
    },
  };
}

function createHourHandler(tz: string): UnitSpec {
  return subDayHandler({
    endOfFn: endOfHour,
    startOfFn: startOfHour,
    timezone: tz,
    unitMs: HOUR_MS,
  });
}
function createMinuteHandler(tz: string): UnitSpec {
  return subDayHandler({
    endOfFn: endOfMinute,
    startOfFn: startOfMinute,
    timezone: tz,
    unitMs: MINUTE_MS,
  });
}
function createSecondHandler(tz: string): UnitSpec {
  return subDayHandler({
    endOfFn: endOfSecond,
    startOfFn: startOfSecond,
    timezone: tz,
    unitMs: SECOND_MS,
  });
}

export {
  createDayHandler,
  createHourHandler,
  createMinuteHandler,
  createMonthHandler,
  createQuarterHandler,
  createSecondHandler,
  createYearHandler,
};
