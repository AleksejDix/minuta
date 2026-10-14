import type { ContextOptions, Duration } from "date-fns";
import {
  add,
  differenceInDays,
  differenceInMonths,
  differenceInQuarters,
  differenceInYears,
  endOfDay,
  endOfMonth,
  endOfQuarter,
  endOfYear,
  startOfDay,
  startOfMonth,
  startOfQuarter,
  startOfYear,
} from "date-fns";
import type { TZDate } from "@date-fns/tz";
import { TZDateMini } from "@date-fns/tz";
import type { UnitSpec } from "#src/types";
import { elapsedSpec } from "#src/adapters/elapsed-units";

const MONTHS_PER_QUARTER = 3;
const HOUR_MS = 3_600_000;
const MINUTE_MS = 60_000;
const SECOND_MS = 1000;

/** Options that make date-fns compute in one zone, never the computer's. */
type Zone = Readonly<ContextOptions<TZDate>> & Readonly<{ name: string }>;

type DateTransform = (date: Readonly<Date>, options: Zone) => Date;

type HandlerParts = Readonly<{
  addKey: keyof Duration;
  diffFn: (
    later: Readonly<Date>,
    earlier: Readonly<Date>,
    options: Zone
  ) => number;
  endOfFn: DateTransform;
  startOfFn: DateTransform;
  zone: Zone;
}>;

// A plain Date, so no TZDate leaks out of the adapter
function instant(date: Readonly<Date>): Date {
  return new Date(date);
}

function handler(parts: HandlerParts): UnitSpec {
  const { zone } = parts;
  return {
    add: (date: Readonly<Date>, amount: number): Date =>
      instant(add(date, { [parts.addKey]: amount }, zone)),
    diff: (from: Readonly<Date>, to: Readonly<Date>): number =>
      parts.diffFn(to, from, zone),
    endOf: (date: Readonly<Date>): Date => instant(parts.endOfFn(date, zone)),
    startOf: (date: Readonly<Date>): Date =>
      instant(parts.startOfFn(date, zone)),
  };
}

function createYearHandler(zone: Zone): UnitSpec {
  return handler({
    addKey: "years",
    diffFn: differenceInYears,
    endOfFn: endOfYear,
    startOfFn: startOfYear,
    zone,
  });
}
function createQuarterHandler(zone: Zone): UnitSpec {
  return {
    add: (date: Readonly<Date>, amount: number): Date =>
      instant(add(date, { months: amount * MONTHS_PER_QUARTER }, zone)),
    diff: (from: Readonly<Date>, to: Readonly<Date>): number =>
      differenceInQuarters(to, from, zone),
    endOf: (date: Readonly<Date>): Date => instant(endOfQuarter(date, zone)),
    startOf: (date: Readonly<Date>): Date =>
      instant(startOfQuarter(date, zone)),
  };
}
function createMonthHandler(zone: Zone): UnitSpec {
  return handler({
    addKey: "months",
    diffFn: differenceInMonths,
    endOfFn: endOfMonth,
    startOfFn: startOfMonth,
    zone,
  });
}
function createDayHandler(zone: Zone): UnitSpec {
  return handler({
    addKey: "days",
    diffFn: differenceInDays,
    endOfFn: endOfDay,
    startOfFn: startOfDay,
    zone,
  });
}

/*
 * Hours, minutes and seconds from the time past the unit on the zone's
 * clock: a repeated hour of a fall-back night stays two hours, and in a
 * zone that moves its clocks by 30 minutes no hour swallows the half hour
 * around it.
 */
function wallOf(zone: Zone, date: Readonly<Date>): TZDate {
  return new TZDateMini(date.getTime(), zone.name);
}
function createHourHandler(zone: Zone): UnitSpec {
  return elapsedSpec(HOUR_MS, (date) => {
    const wall = wallOf(zone, date);
    return (
      wall.getMinutes() * MINUTE_MS +
      wall.getSeconds() * SECOND_MS +
      wall.getMilliseconds()
    );
  });
}
function createMinuteHandler(zone: Zone): UnitSpec {
  return elapsedSpec(MINUTE_MS, (date) => {
    const wall = wallOf(zone, date);
    return wall.getSeconds() * SECOND_MS + wall.getMilliseconds();
  });
}
function createSecondHandler(zone: Zone): UnitSpec {
  return elapsedSpec(SECOND_MS, (date) => wallOf(zone, date).getMilliseconds());
}

export {
  createDayHandler,
  createHourHandler,
  createMinuteHandler,
  createMonthHandler,
  createQuarterHandler,
  createSecondHandler,
  createYearHandler,
  instant,
};
export type { Zone };
