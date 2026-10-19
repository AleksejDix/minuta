/**
 * ISO 8601 and RFC 3339 dates and date-times, read exactly: `2026-03-31`,
 * `2026-03-31T10:00`, `2026-03-31 10:00:00.250+02:00`, `20260331T100000Z`.
 */

import { clockProblem, offsetMinutes, problemOf } from "./date";
import { failure, success } from "./choose";
import { ParseError } from "./errors";
import type { ParseResult } from "./choose";
import type { Reading } from "./candidates";
import { groupsOf } from "./regex";

/*
 * A decimal fraction may end the time on the hour, the minute or the
 * second, with any number of digits; the hour alone is reduced precision
 */
const ISO =
  /^(?<year>[+-]?\d{4,6})-?(?<month>\d{2})-?(?<day>\d{2})(?:[t\s](?<hour>\d{2})(?:[.,](?<hourFraction>\d+)|:?(?<minute>\d{2})(?:[.,](?<minuteFraction>\d+)|:?(?<second>\d{2})(?:[.,](?<fraction>\d+))?)?)?\s*(?<offset>z|[+-]\d{2}(?::?\d{2})?)?)?$/giu;
// A date and a T: the text is an ISO 8601 date-time, or a broken one
const ISO_DATE_TIME = /^[+-]?\d{4,6}-?\d{2}-?\d{2}t/iu;
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

/** The fields of an ISO 8601 text, as written. */
type IsoFields = Readonly<{
  day: number;
  hour: number;
  millisecond: number;
  minute: number;
  month: number;
  offsetMinutes: number | undefined;
  second: number;
  year: number;
}>;

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
 * The fields of an ISO 8601 / RFC 3339 date or date-time, basic or extended.
 *
 * @param text - Normalised text
 * @returns The fields as written, or undefined when the text is not ISO 8601
 */
function isoFields(text: string): IsoFields | undefined {
  const groups = groupsOf(text, ISO);
  if (groups === undefined) {
    return undefined;
  }
  const spread = spreadFraction(
    fractionMs(groups["hourFraction"], MS_PER_HOUR) +
      fractionMs(groups["minuteFraction"], MS_PER_MINUTE)
  );
  return {
    day: Number(groups["day"]),
    hour: Number(groups["hour"] ?? NONE),
    millisecond:
      spread.millisecond +
      Number(
        (groups["fraction"] ?? "").padEnd(MS_DIGITS, "0").slice(NONE, MS_DIGITS)
      ),
    minute: Number(groups["minute"] ?? NONE) + spread.minute,
    month: Number(groups["month"]),
    offsetMinutes: offsetMinutesOf(groups["offset"]),
    second: Number(groups["second"] ?? NONE) + spread.second,
    year: Number(groups["year"]),
  };
}

/**
 * A real ISO 8601 day at its time, unless the time or offset is out of
 * range: unlike free text, ISO 8601 has no other reading to fall back to.
 *
 * @param reading - The day
 * @param fields - The fields as written
 * @returns The result
 */
function checked(reading: Reading, fields: IsoFields): ParseResult {
  const problem = clockProblem(fields);
  if (problem === undefined) {
    return success(reading, fields);
  }
  return failure([problem]);
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
 * ISO 8601 read exactly. Eight digits without dashes may be a day-first
 * date, so an impossible compact ISO date is read as numbers instead.
 *
 * @param text - Normalised text
 * @returns The result, or undefined when the text is not (compact) ISO 8601
 */
function parseIso(text: string): ParseResult | undefined {
  const fields = isoFields(text);
  if (fields === undefined) {
    return brokenIso(text);
  }
  const reading: Reading = {
    day: fields.day,
    month: fields.month,
    order: "YMD",
    year: fields.year,
  };
  const problem = problemOf(reading);
  if (problem === undefined) {
    return checked(reading, fields);
  }
  if (text.includes("-")) {
    return failure([problem]);
  }
  return undefined;
}

export { parseIso };
