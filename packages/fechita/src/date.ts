/**
 * Calendar arithmetic for readings: which readings name a real day, and the
 * Date they stand for.
 */

import type { DateParts } from "./types";
import { ParseError } from "./errors";
import type { ParseErrorCode } from "./errors";
import type { Reading } from "./candidates";

const MONTHS = 12;
const JANUARY = 0;
const DECEMBER = 11;
const FIRST = 1;
const LAST_OF_DECEMBER = 31;
// ISO 8601 week 1 is the week with January 4, and weeks start on Monday
const WEEK_ONE_DAY = 4;
const DAYS_PER_WEEK = 7;
const THURSDAY = 4;
const WEEKS = 52;
const LONG_YEAR_WEEKS = 53;
const NONE = 0;
const MS_PER_MINUTE = 60_000;
const MINUTES_PER_HOUR = 60;
const MAX_HOUR = 23;
const MAX_MINUTE = 59;
// 60 is a leap second (RFC 3339)
const MAX_SECOND = 60;

/** The time of day a reading is combined with. */
type Clock = Readonly<{
  hour: number;
  millisecond: number;
  minute: number;
  offsetMinutes: number | undefined;
  second: number;
}>;

/** No time in the text: local midnight. */
const MIDNIGHT: Clock = {
  hour: NONE,
  millisecond: NONE,
  minute: NONE,
  offsetMinutes: undefined,
  second: NONE,
};

/**
 * The UTC midnight of a day, counted from the first of a month: day 0 is
 * the day before, day 32 of January is February 1. Years below 100 are
 * taken literally.
 *
 * @param year - The year
 * @param month - Month 0–11
 * @param day - The day of the month, any number
 * @returns The UTC midnight
 */
function utcDay(year: number, month: number, day: number): Date {
  const date = new Date(NONE);
  date.setUTCFullYear(year, month, day);
  return date;
}

function readingAt(date: Readonly<Date>): Reading {
  return {
    day: date.getUTCDate(),
    month: date.getUTCMonth() + FIRST,
    order: "YMD",
    year: date.getUTCFullYear(),
  };
}

/**
 * The day of an ISO 8601 ordinal date: `2026-286` is October 13.
 *
 * @param year - The year
 * @param ordinal - The day of the year, 1–365 or 366 in leap years
 * @returns The day, or `INVALID_DAY` when the year has no such day
 */
function ordinalReading(
  year: number,
  ordinal: number
): Reading | ParseErrorCode {
  const date = utcDay(year, JANUARY, ordinal);
  if (ordinal < FIRST || date.getUTCFullYear() !== year) {
    return ParseError.InvalidDay;
  }
  return readingAt(date);
}

/**
 * The ISO 8601 weeks of a year: 53 when it starts or ends on a Thursday,
 * otherwise 52.
 *
 * @param year - The ISO week-numbering year
 * @returns 52 or 53
 */
function weeksIn(year: number): number {
  const ends = [
    utcDay(year, JANUARY, FIRST).getUTCDay(),
    utcDay(year, DECEMBER, LAST_OF_DECEMBER).getUTCDay(),
  ];
  if (ends.includes(THURSDAY)) {
    return LONG_YEAR_WEEKS;
  }
  return WEEKS;
}

/**
 * The day of an ISO 8601 week date: `2026-W42-2` is Tuesday, October 13.
 * Week 1 may start in the year before: `2025-W01-1` is December 30, 2024.
 *
 * @param year - The ISO week-numbering year
 * @param week - The week, 1–52 or 53
 * @param weekday - The weekday, 1 (Monday) to 7 (Sunday)
 * @returns The day, or `INVALID_DAY` / `INVALID_WEEK`
 */
function weekReading(
  year: number,
  week: number,
  weekday: number
): Reading | ParseErrorCode {
  if (weekday < FIRST || weekday > DAYS_PER_WEEK) {
    return ParseError.InvalidDay;
  }
  if (week < FIRST || week > weeksIn(year)) {
    return ParseError.InvalidWeek;
  }
  // Days since Monday: Sunday, day 0 of getUTCDay, is the seventh
  const sinceMonday =
    (utcDay(year, JANUARY, WEEK_ONE_DAY).getUTCDay() + DAYS_PER_WEEK - FIRST) %
    DAYS_PER_WEEK;
  return readingAt(
    utcDay(
      year,
      JANUARY,
      WEEK_ONE_DAY -
        sinceMonday +
        (week - FIRST) * DAYS_PER_WEEK +
        weekday -
        FIRST
    )
  );
}

function daysIn(year: number, month: number): number {
  const date = new Date(NONE);
  date.setFullYear(year, month, NONE);
  return date.getDate();
}

/**
 * Why a reading names no real day, if it does not.
 *
 * @param reading - Day, month and year
 * @returns The error code, or undefined for a real day
 */
function problemOf(reading: Reading): ParseErrorCode | undefined {
  if (reading.month < FIRST || reading.month > MONTHS) {
    return ParseError.InvalidMonth;
  }
  if (
    reading.day < FIRST ||
    reading.day > daysIn(reading.year, reading.month)
  ) {
    return ParseError.InvalidDay;
  }
  return undefined;
}

/**
 * A UTC offset in minutes from its written parts, or NaN when a part is out
 * of range: at most ±23:59, as RFC 3339 writes it.
 *
 * @param sign - 1 or -1
 * @param hours - The written hours
 * @param minutes - The written minutes
 * @returns The offset in minutes, or NaN
 */
function offsetMinutes(sign: number, hours: number, minutes: number): number {
  if (hours > MAX_HOUR || minutes > MAX_MINUTE) {
    return Number.NaN;
  }
  const total = hours * MINUTES_PER_HOUR + minutes;
  // -00:00 is UTC too; a sign times zero would give -0
  if (total === NONE) {
    return NONE;
  }
  return sign * total;
}

/**
 * Why a time of day is not one, if it is not. ISO 8601-1:2019 no longer
 * allows 24:00, so hours are 0–23.
 *
 * @param clock - The time as written
 * @returns `INVALID_TIME`, `INVALID_OFFSET`, or undefined for a real time
 */
function clockProblem(clock: Clock): ParseErrorCode | undefined {
  if (
    clock.hour > MAX_HOUR ||
    clock.minute > MAX_MINUTE ||
    clock.second > MAX_SECOND
  ) {
    return ParseError.InvalidTime;
  }
  if (Number.isNaN(clock.offsetMinutes)) {
    return ParseError.InvalidOffset;
  }
  return undefined;
}

/**
 * The fields of a reading at a time of day.
 *
 * @param reading - Day, month and year
 * @param clock - Time of day and offset
 * @returns The date parts
 */
function partsOf(reading: Reading, clock: Clock): DateParts {
  return {
    day: reading.day,
    hour: clock.hour,
    millisecond: clock.millisecond,
    minute: clock.minute,
    month: reading.month,
    offsetMinutes: clock.offsetMinutes,
    second: clock.second,
    year: reading.year,
  };
}

/**
 * The Date of some parts: local time, or the exact instant with an offset.
 * Years below 100 are taken literally.
 *
 * @param parts - The date parts
 * @returns The Date
 */
function dateOf(parts: DateParts): Date {
  const date = new Date(NONE);
  if (parts.offsetMinutes === undefined) {
    date.setFullYear(parts.year, parts.month - FIRST, parts.day);
    date.setHours(parts.hour, parts.minute, parts.second, parts.millisecond);
    return date;
  }
  date.setUTCFullYear(parts.year, parts.month - FIRST, parts.day);
  date.setUTCHours(parts.hour, parts.minute, parts.second, parts.millisecond);
  return new Date(date.getTime() - parts.offsetMinutes * MS_PER_MINUTE);
}

export {
  MIDNIGHT,
  clockProblem,
  dateOf,
  offsetMinutes,
  ordinalReading,
  partsOf,
  problemOf,
  weekReading,
};
export type { Clock };
