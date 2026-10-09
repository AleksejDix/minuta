/**
 * The rules of parseDateWith: recognise the date in text whatever its form,
 * report every way it can be read, and pick one only when the text, the
 * order or the locale leaves no doubt.
 */

import type { Locales, ParseOptions } from "./types";
import { chosen, failure } from "./choose";
import { contextOf, tablesOf, weekdayTables } from "./context";
import { findWord, withoutWord } from "./match";
import { namedReadings, numericReadings } from "./candidates";
import { timeIn, untimed } from "./time";
import { BC } from "./words";
import type { Context } from "./context";
import type { Found } from "./match";
import type { ParseErrorCode } from "./errors";
import type { ParseResult } from "./choose";
import type { Reading } from "./candidates";
import { normalized } from "./text";
import { parseIso } from "./iso";

const ONE = 1;
const NONE = 0;
const DIGIT_RUNS = /\d+/gu;
const WORD_MINIMUMS = { all: 3, own: 1 } as const;
const ERA_MINIMUMS = { all: 3, own: 1 } as const;
// "日" is a Japanese weekday and part of every Japanese date
const WEEKDAY_MINIMUMS = { all: 3, own: 2 } as const;

/**
 * The month word, not taken from inside a weekday: in Welsh "Dydd Mawrth"
 * (Tuesday) contains "Mawrth" (March).
 *
 * @param rest - Text without the time
 * @param context - Words and options
 * @returns The month word, or undefined
 */
function monthIn(rest: string, context: Context): Found | undefined {
  const month = findWord(rest, tablesOf(context, "months"), WORD_MINIMUMS);
  const weekday = findWord(rest, weekdayTables(context), WEEKDAY_MINIMUMS);
  if (
    month === undefined ||
    weekday === undefined ||
    weekday.key === month.key ||
    !weekday.key.includes(month.key)
  ) {
    return month;
  }
  return findWord(
    withoutWord(rest, weekday),
    tablesOf(context, "months"),
    WORD_MINIMUMS
  );
}

function beforeCommonEra(reading: Reading): Reading {
  return {
    day: reading.day,
    month: reading.month,
    order: reading.order,
    year: ONE - reading.year,
  };
}

// The era word, if any: "v. Chr.", "BC", "n. Chr."
function eraIn(rest: string, context: Context): Found | undefined {
  return findWord(rest, tablesOf(context, "eras"), ERA_MINIMUMS);
}

/**
 * The readings next to a month name. With an era the year is as written
 * ("44 v. Chr."), and BC counts back: 1 BC is year 0.
 *
 * @param named - The digit groups and the month 1–12
 * @param rest - Text without the time and the month word
 * @param context - Words and options
 * @returns The readings
 */
function namedWithEra(
  named: Readonly<{ groups: readonly string[]; month: number }>,
  rest: string,
  context: Context
): Reading[] {
  const era = eraIn(rest, context);
  if (era === undefined) {
    return namedReadings(
      named.groups,
      named.month,
      context.options.referenceDate ?? new Date()
    );
  }
  const readings = namedReadings(named.groups, named.month);
  if (!era.values.has(BC)) {
    return readings;
  }
  return readings.map((reading) => beforeCommonEra(reading));
}

/**
 * Every reading of the text without the time: next to a month name, or of
 * its numbers alone.
 *
 * @param rest - Text without the time
 * @param month - The month word, if any
 * @param context - Words and options
 * @returns The readings, or the reason there are none
 */
function readingsIn(
  rest: string,
  month: Found | undefined,
  context: Context
): Reading[] | ParseErrorCode {
  const reference = context.options.referenceDate ?? new Date();
  const groups = rest.match(DIGIT_RUNS) ?? [];
  if (month === undefined) {
    return numericReadings(groups, reference);
  }
  const [index = NONE] = month.values;
  if (month.values.size > ONE) {
    return "AMBIGUOUS_MONTH";
  }
  return namedWithEra(
    { groups, month: index + ONE },
    withoutWord(rest, month),
    context
  );
}

// A month name is not also read as a weekday of another language ("Dis")
function weekdayFits(
  day: number,
  found: Readonly<{ month: Found | undefined; rest: string }>,
  context: Context
): boolean {
  const weekday = findWord(
    withoutWord(found.rest, found.month),
    weekdayTables(context),
    WEEKDAY_MINIMUMS
  );
  return weekday === undefined || weekday.values.has(day);
}

// The month word and the readings of the text without the time
function datesIn(
  rest: string,
  context: Context
): Readonly<{
  month: Found | undefined;
  readings: Reading[] | ParseErrorCode;
}> {
  const month = monthIn(rest, context);
  return { month, readings: readingsIn(rest, month, context) };
}

/**
 * The date in text that is not ISO 8601: times, month and weekday names,
 * eras and numbers in any order.
 *
 * @param text - Normalised text
 * @param context - Words and options
 * @returns The result
 */
function parseFree(text: string, context: Context): ParseResult {
  const time = timeIn(text, tablesOf(context, "periods")) ?? untimed(text);
  if (!time.valid) {
    return failure(["INVALID_TIME"]);
  }
  const { month, readings } = datesIn(time.rest, context);
  if (typeof readings === "string") {
    return failure([readings]);
  }
  const result = chosen(readings, time, context);
  if (
    result.valid &&
    !weekdayFits(result.date.getDay(), { month, rest: time.rest }, context)
  ) {
    return failure(["WEEKDAY_MISMATCH"]);
  }
  return result;
}

/**
 * Read the date in `text` with the words of `locales`. ISO 8601 is read
 * exactly; otherwise times, month and weekday names, eras and numbers in
 * any order are recognised, and a date is returned only when exactly one
 * reading exists, or `order` / `locale` picks one.
 *
 * @example
 * import { withLocales } from "fechita/core";
 * import { de } from "fechita/locales/de";
 * import { en } from "fechita/locales/en";
 *
 * parseDateWith({ de, en }, "31. März 2026").valid; // true
 * parseDateWith({ de, en }, "04/05/2026").valid; // false: AMBIGUOUS_DAY_MONTH
 *
 * @param locales - Locale data whose words to read
 * @param text - The text to read
 * @param options - `order` or `locale` to resolve ambiguous dates
 * @returns The date, or the error codes and candidate dates
 */
function parseDateWith(
  locales: Locales,
  text: string,
  options: ParseOptions = {}
): ParseResult {
  const clean = normalized(text);
  return parseIso(clean) ?? parseFree(clean, contextOf(locales, options));
}

export { parseDateWith };
export type { ParseResult } from "./choose";
