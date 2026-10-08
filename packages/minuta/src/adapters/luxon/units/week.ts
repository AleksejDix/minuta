import { DateTime } from "luxon";
import type { UnitHandler } from "#src/types";

const DAYS_PER_WEEK = 7;
const LAST_DAY_OF_WEEK_OFFSET = 6;
const ISO_MONDAY = 1;
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

function endOfWeekStartingOn(date: Readonly<Date>, isoWeekday: number): Date {
  const dateTime = DateTime.fromJSDate(date);
  const endOfWeek = dateTime.endOf("week");

  // Adjust if week doesn't start on Monday
  if (isoWeekday !== ISO_MONDAY) {
    const mondayStart = dateTime.startOf("week");
    const daysToSubtract = daysSinceWeekStart(mondayStart.weekday, isoWeekday);
    const weekStart = mondayStart.minus({ days: daysToSubtract });
    return weekStart
      .plus({ days: LAST_DAY_OF_WEEK_OFFSET })
      .endOf("day")
      .toJSDate();
  }

  return endOfWeek.toJSDate();
}

function startOfWeekStartingOn(date: Readonly<Date>, isoWeekday: number): Date {
  const startOfWeek = DateTime.fromJSDate(date).startOf("week");

  // Adjust if week doesn't start on the configured day
  if (isoWeekday !== ISO_MONDAY) {
    const daysToSubtract = daysSinceWeekStart(startOfWeek.weekday, isoWeekday);
    return startOfWeek.minus({ days: daysToSubtract }).toJSDate();
  }

  return startOfWeek.toJSDate();
}

function createWeekHandler(weekStartsOn: WeekStartsOn = MONDAY): UnitHandler {
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
export type { WeekStartsOn };
