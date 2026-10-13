import { DateTime } from "luxon";
import type { UnitSpec } from "#src/types";

const DAYS_PER_WEEK = 7;
const LAST_DAY_OF_WEEK_OFFSET = 6;
const ISO_SUNDAY = 7;

const SUNDAY = 0;
const MONDAY = 1;
const TUESDAY = 2;
const WEDNESDAY = 3;
const THURSDAY = 4;
const FRIDAY = 5;
const SATURDAY = 6;

type WeekStartsOn =
  | typeof SUNDAY
  | typeof MONDAY
  | typeof TUESDAY
  | typeof WEDNESDAY
  | typeof THURSDAY
  | typeof FRIDAY
  | typeof SATURDAY;

/*
 * Luxon uses ISO week days (1-7, Monday-Sunday)
 * JavaScript uses 0-6 (Sunday-Saturday)
 * Convert JavaScript weekday to ISO weekday
 */
function toIsoWeekday(weekStartsOn: WeekStartsOn): number {
  if (weekStartsOn === SUNDAY) {
    return ISO_SUNDAY;
  }
  return weekStartsOn;
}

function daysSinceWeekStart(
  currentWeekday: number,
  isoWeekday: number
): number {
  return (currentWeekday - isoWeekday + DAYS_PER_WEEK) % DAYS_PER_WEEK;
}

// Count back from the date's own weekday, so a Sunday is the start of its own week
function startOfWeekStartingOn(date: Readonly<Date>, isoWeekday: number): Date {
  const day = DateTime.fromJSDate(date).startOf("day");
  return day
    .minus({ days: daysSinceWeekStart(day.weekday, isoWeekday) })
    .toJSDate();
}

function endOfWeekStartingOn(date: Readonly<Date>, isoWeekday: number): Date {
  return DateTime.fromJSDate(startOfWeekStartingOn(date, isoWeekday))
    .plus({ days: LAST_DAY_OF_WEEK_OFFSET })
    .endOf("day")
    .toJSDate();
}

function createWeekHandler(weekStartsOn: WeekStartsOn = MONDAY): UnitSpec {
  const isoWeekday = toIsoWeekday(weekStartsOn);

  return {
    add(date: Readonly<Date>, amount: number): Date {
      return DateTime.fromJSDate(date).plus({ weeks: amount }).toJSDate();
    },

    diff(from: Readonly<Date>, to: Readonly<Date>): number {
      const start = DateTime.fromJSDate(from);
      const end = DateTime.fromJSDate(to);
      return Math.floor(end.diff(start, "weeks").weeks);
    },

    endOf(date: Readonly<Date>): Date {
      return endOfWeekStartingOn(date, isoWeekday);
    },

    startOf(date: Readonly<Date>): Date {
      return startOfWeekStartingOn(date, isoWeekday);
    },
  };
}

export { createWeekHandler };
