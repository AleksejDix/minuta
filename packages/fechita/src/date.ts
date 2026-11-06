/**
 * Calendar arithmetic for readings: which readings name a real day, and the
 * Temporal value they stand for.
 */

import type { DateParts } from "./types";
import { ParseError } from "./errors";
import type { ParseErrorCode } from "./errors";
import type { Reading } from "./candidates";
import type { Temporal } from "./temporal";
import { temporal } from "./temporal";

const MONTHS = 12;
const FIRST = 1;
const LAST_OF_DECEMBER = 31;
// ISO 8601 week 1 is the week with January 4, and weeks start on Monday
const WEEK_ONE_DAY = 4;
const DAYS_PER_WEEK = 7;
const THURSDAY = 4;
const WEEKS = 52;
const LONG_YEAR_WEEKS = 53;
const NONE = 0;
const MINUTES_PER_HOUR = 60;
const MAX_HOUR = 23;
const MAX_MINUTE = 59;
// 60 is a leap second (RFC 3339)
const MAX_SECOND = 60;
/*
 * The years whose every day, time and offset Temporal can hold: it ends
 * inside -271821 and 275760
 */
const MIN_YEAR = -271_820;
const MAX_YEAR = 275_759;

/** The time of day a reading is combined with. */
type Clock = Readonly<{
  hour: number;
  millisecond: number;
  minute: number;
  offsetMinutes: number | undefined;
  second: number;
}>;

/** The fields of a date without a time. */
const MIDNIGHT: Clock = {
  hour: NONE,
  millisecond: NONE,
  minute: NONE,
  offsetMinutes: undefined,
  second: NONE,
};

/**
 * The value a text stands for: a date, a wall-clock date and time, or the
 * exact instant when the text has an offset.
 */
type Parsed =
  | Readonly<{ kind: "date"; value: Temporal.PlainDate }>
  | Readonly<{ kind: "dateTime"; value: Temporal.PlainDateTime }>
  | Readonly<{ kind: "instant"; value: Temporal.Instant }>;

/** One of the values `parseDate` returns. */
type ParsedValue = Parsed["value"];

function inRange(year: number): boolean {
  return year >= MIN_YEAR && year <= MAX_YEAR;
}

/** The day, month and year of a reading or of date parts. */
type Day = Pick<Reading, "day" | "month" | "year">;

function dayOf(reading: Day): Temporal.PlainDate {
  return temporal().PlainDate.from({
    day: reading.day,
    month: reading.month,
    year: reading.year,
  });
}

function readingAt(date: Readonly<Temporal.PlainDate>): Reading {
  return { day: date.day, month: date.month, order: "YMD", year: date.year };
}

/**
 * The day of an ISO 8601 ordinal date: `2026-286` is October 13.
 *
 * @param year - The year
 * @param ordinal - The day of the year, 1–365 or 366 in leap years
 * @returns The day, or `INVALID_DAY` / `OUT_OF_RANGE`
 */
function ordinalReading(
  year: number,
  ordinal: number
): Reading | ParseErrorCode {
  if (!inRange(year)) {
    return ParseError.OutOfRange;
  }
  const first = dayOf({ day: FIRST, month: FIRST, year });
  if (ordinal < FIRST || ordinal > first.daysInYear) {
    return ParseError.InvalidDay;
  }
  return readingAt(first.add({ days: ordinal - FIRST }));
}

/**
 * The ISO 8601 weeks of a year: 53 when it starts or ends on a Thursday,
 * otherwise 52.
 *
 * @param first - January 1 of the ISO week-numbering year
 * @returns 52 or 53
 */
function weeksIn(first: Readonly<Temporal.PlainDate>): number {
  const ends = [
    first.dayOfWeek,
    first.with({ day: LAST_OF_DECEMBER, month: MONTHS }).dayOfWeek,
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
 * @returns The day, or `INVALID_DAY` / `INVALID_WEEK` / `OUT_OF_RANGE`
 */
function weekReading(
  year: number,
  week: number,
  weekday: number
): Reading | ParseErrorCode {
  if (!inRange(year)) {
    return ParseError.OutOfRange;
  }
  if (weekday < FIRST || weekday > DAYS_PER_WEEK) {
    return ParseError.InvalidDay;
  }
  const first = dayOf({ day: FIRST, month: FIRST, year });
  if (week < FIRST || week > weeksIn(first)) {
    return ParseError.InvalidWeek;
  }
  const weekOne = first.with({ day: WEEK_ONE_DAY });
  return readingAt(
    weekOne.add({
      days: (week - FIRST) * DAYS_PER_WEEK + weekday - weekOne.dayOfWeek,
    })
  );
}

function daysIn(year: number, month: number): number {
  return temporal().PlainYearMonth.from({ month, year }).daysInMonth;
}

/**
 * Why a reading names no real day, if it does not.
 *
 * @param reading - Day, month and year
 * @returns The error code, or undefined for a real day
 */
function problemOf(reading: Reading): ParseErrorCode | undefined {
  if (!inRange(reading.year)) {
    return ParseError.OutOfRange;
  }
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
 * @param clock - The time as written, undefined when there is none
 * @returns `INVALID_TIME`, `INVALID_OFFSET`, or undefined for a real time
 */
function clockProblem(clock: Clock | undefined): ParseErrorCode | undefined {
  if (clock === undefined) {
    return undefined;
  }
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
 * @param clock - Time of day and offset; midnight when undefined
 * @returns The date parts
 */
function partsOf(reading: Reading, clock: Clock = MIDNIGHT): DateParts {
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
 * The value of a real day at a time of day: the date when the text has no
 * time, the wall-clock date and time when it has no offset, otherwise the
 * exact instant. A leap second is the second before, as in Temporal.
 *
 * @param reading - Day, month and year of a real day
 * @param clock - Time of day and offset, undefined when the text has none
 * @returns The value and its kind
 */
function parsedOf(reading: Reading, clock: Clock | undefined): Parsed {
  const day = dayOf(reading);
  if (clock === undefined) {
    return { kind: "date", value: day };
  }
  const wall = day.toPlainDateTime({
    hour: clock.hour,
    millisecond: clock.millisecond,
    minute: clock.minute,
    second: Math.min(clock.second, MAX_MINUTE),
  });
  if (clock.offsetMinutes === undefined) {
    return { kind: "dateTime", value: wall };
  }
  return {
    kind: "instant",
    value: wall
      .toZonedDateTime("UTC")
      .toInstant()
      .subtract({ minutes: clock.offsetMinutes }),
  };
}

/**
 * The weekday of a real day, 0 (Sunday) to 6 (Saturday), as the locale
 * data counts them.
 *
 * @param reading - Day, month and year of a real day
 * @returns The weekday
 */
function weekdayOf(reading: Day): number {
  return dayOf(reading).dayOfWeek % DAYS_PER_WEEK;
}

export {
  clockProblem,
  offsetMinutes,
  ordinalReading,
  parsedOf,
  partsOf,
  problemOf,
  weekReading,
  weekdayOf,
};
export type { Clock, Parsed, ParsedValue };
