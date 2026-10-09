/**
 * Calendar arithmetic for readings: which readings name a real day, and the
 * Date they stand for.
 */

import type { DateParts } from "./types";
import { ParseError } from "./errors";
import type { ParseErrorCode } from "./errors";
import type { Reading } from "./candidates";

const MONTHS = 12;
const FIRST = 1;
const NONE = 0;
const MS_PER_MINUTE = 60_000;

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

export { MIDNIGHT, dateOf, partsOf, problemOf };
export type { Clock };
