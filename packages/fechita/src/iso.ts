/**
 * ISO 8601 and RFC 3339 dates and date-times, read exactly: `2026-03-31`,
 * `2026-03-31T10:00`, `2026-03-31 10:00:00.250+02:00`, `20260331T100000Z`,
 * and ordinal dates: `2026-090`.
 */

import { clockProblem, offsetMinutes, ordinalReading, problemOf } from "./date";
import { failure, success } from "./choose";
import type { Clock } from "./date";
import { ParseError } from "./errors";
import type { ParseErrorCode } from "./errors";
import type { ParseResult } from "./choose";
import type { Reading } from "./candidates";
import { groupsOf } from "./regex";

/*
 * The time after an ISO 8601 date. A decimal fraction may end the time on
 * the hour, the minute or the second, with any number of digits; the hour
 * alone is reduced precision
 */
const TIME = String.raw`(?:[t\s](?<hour>\d{2})(?:[.,](?<hourFraction>\d+)|:?(?<minute>\d{2})(?:[.,](?<minuteFraction>\d+)|:?(?<second>\d{2})(?:[.,](?<fraction>\d+))?)?)?\s*(?<offset>z|[+-]\d{2}(?::?\d{2})?)?)?$`;

/**
 * A pattern for an ISO 8601 date, alone or followed by a time.
 *
 * @param date - The source of the date part
 * @returns The pattern, with the `g` flag for `groupsOf`
 */
function isoPattern(date: string): RegExp {
  return new RegExp(`^${date}${TIME}`, "giu");
}

const CALENDAR = isoPattern(
  String.raw`(?<year>[+-]?\d{4,6})-?(?<month>\d{2})-?(?<day>\d{2})`
);
// An unsigned year has four digits: eight digits are a compact calendar date
const ORDINAL = isoPattern(
  String.raw`(?<year>[+-]\d{4,6}|\d{4})-?(?<ordinal>\d{3})`
);
// A date and a T: the text is an ISO 8601 date-time, or a broken one
const ISO_DATE_TIME =
  /^(?:[+-]?\d{4,6}-?\d{2}-?\d{2}|(?:[+-]\d{4,6}|\d{4})-?\d{3})t/iu;
const OFFSET = /^(?<sign>[+-])(?<hours>\d{2}):?(?<minutes>\d{2})?$/gu;
const MS_DIGITS = 3;
const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = 60_000;
const MS_PER_HOUR = 3_600_000;
const DECIMAL = 10;
// Nanoseconds: more digits cannot change the milliseconds
const FRACTION_DIGITS = 9;
const NONE = 0;
const NEGATIVE = -1;
const POSITIVE = 1;

/** The named groups of a match of an ISO 8601 pattern. */
type Groups = Readonly<Record<string, string | undefined>>;

function signOf(sign: string | undefined): number {
  if (sign === "-") {
    return NEGATIVE;
  }
  return POSITIVE;
}

function offsetMinutesOf(offset: string | undefined): number | undefined {
  if (offset === undefined) {
    return undefined;
  }
  const groups = groupsOf(offset, OFFSET);
  if (groups === undefined) {
    // Z
    return NONE;
  }
  return offsetMinutes(
    signOf(groups["sign"]),
    Number(groups["hours"]),
    Number(groups["minutes"] ?? NONE)
  );
}

/**
 * The milliseconds a decimal fraction of a unit stands for, cut to whole
 * milliseconds like a fraction of a second: `5` of an hour is 1 800 000.
 *
 * @param digits - The digits after the decimal sign, if written
 * @param unitMs - The milliseconds in the unit the fraction belongs to
 * @returns The milliseconds, 0 when no fraction is written
 */
function fractionMs(digits: string | undefined, unitMs: number): number {
  if (digits === undefined) {
    return NONE;
  }
  const kept = digits.slice(NONE, FRACTION_DIGITS);
  const scaled = Number(kept) * unitMs;
  const divisor = DECIMAL ** kept.length;
  return (scaled - (scaled % divisor)) / divisor;
}

/**
 * Milliseconds below one hour split into minutes, seconds and milliseconds.
 *
 * @param ms - Milliseconds, less than an hour
 * @returns The parts
 */
function spreadFraction(
  ms: number
): Readonly<{ millisecond: number; minute: number; second: number }> {
  return {
    millisecond: ms % MS_PER_SECOND,
    minute: Math.floor(ms / MS_PER_MINUTE),
    second: Math.floor((ms % MS_PER_MINUTE) / MS_PER_SECOND),
  };
}

/**
 * The time of an ISO 8601 / RFC 3339 date-time, basic or extended: midnight
 * when the text has only a date.
 *
 * @param groups - The groups of the match
 * @returns The time as written
 */
function clockOf(groups: Groups): Clock {
  const spread = spreadFraction(
    fractionMs(groups["hourFraction"], MS_PER_HOUR) +
      fractionMs(groups["minuteFraction"], MS_PER_MINUTE)
  );
  return {
    hour: Number(groups["hour"] ?? NONE),
    millisecond:
      spread.millisecond +
      Number(
        (groups["fraction"] ?? "").padEnd(MS_DIGITS, "0").slice(NONE, MS_DIGITS)
      ),
    minute: Number(groups["minute"] ?? NONE) + spread.minute,
    offsetMinutes: offsetMinutesOf(groups["offset"]),
    second: Number(groups["second"] ?? NONE) + spread.second,
  };
}

/**
 * The day of an ISO 8601 date, at its time, unless the time or offset is
 * out of range: unlike free text, ISO 8601 has no other reading to fall
 * back to.
 *
 * @param day - The day, why it is none, or undefined to read the text as
 *   free text
 * @param groups - The groups of the match
 * @returns The result, or undefined
 */
function dated(
  day: Reading | ParseErrorCode | undefined,
  groups: Groups
): ParseResult | undefined {
  if (day === undefined) {
    return undefined;
  }
  if (typeof day === "string") {
    return failure([day]);
  }
  const clock = clockOf(groups);
  const problem = clockProblem(clock);
  if (problem === undefined) {
    return success(day, clock);
  }
  return failure([problem]);
}

/**
 * The day of a calendar date. Eight digits without dashes may be a
 * day-first date, so an impossible compact date is read as numbers instead.
 *
 * @param groups - The groups of the match
 * @param text - Normalised text
 * @returns The day, why it is none, or undefined for free text
 */
function calendarDay(
  groups: Groups,
  text: string
): Reading | ParseErrorCode | undefined {
  const reading: Reading = {
    day: Number(groups["day"]),
    month: Number(groups["month"]),
    order: "YMD",
    year: Number(groups["year"]),
  };
  const problem = problemOf(reading);
  if (problem === undefined) {
    return reading;
  }
  if (text.includes("-")) {
    return problem;
  }
  return undefined;
}

/**
 * A text with a date and a T that is not valid ISO 8601, such as
 * `2026-10-13T10:04:05.Z`: reading only its date as free text would drop
 * the time.
 *
 * @param text - Normalised text that is not ISO 8601
 * @returns `INVALID_TIME` for a broken ISO date-time, otherwise undefined
 */
function brokenIso(text: string): ParseResult | undefined {
  if (ISO_DATE_TIME.test(text)) {
    return failure([ParseError.InvalidTime]);
  }
  return undefined;
}

/**
 * ISO 8601 read exactly.
 *
 * @param text - Normalised text
 * @returns The result, or undefined when the text is not (compact) ISO 8601
 */
function parseIso(text: string): ParseResult | undefined {
  const calendar = groupsOf(text, CALENDAR);
  if (calendar !== undefined) {
    return dated(calendarDay(calendar, text), calendar);
  }
  const ordinal = groupsOf(text, ORDINAL);
  if (ordinal !== undefined) {
    return dated(
      ordinalReading(Number(ordinal["year"]), Number(ordinal["ordinal"])),
      ordinal
    );
  }
  return brokenIso(text);
}

export { parseIso };
