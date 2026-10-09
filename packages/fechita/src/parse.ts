/**
 * The rules of parseDateWith: recognise the date in text whatever its form,
 * report every way it can be read, and pick one only when the text, the
 * order or the locale leaves no doubt.
 */

import { BC, localeFor, wordsOf } from "./words";
import type { Found, Tables } from "./match";
import type { LocaleData, Locales, ParseOptions } from "./types";
import { MIDNIGHT, problemOf } from "./date";
import { chosen, failure, success } from "./choose";
import { findWord, withoutWord } from "./match";
import { namedReadings, numericReadings } from "./candidates";
import type { ParseErrorCode } from "./errors";
import type { ParseResult } from "./choose";
import type { Reading } from "./candidates";
import type { TimeOfDay } from "./time";
import type { Words } from "./words";
import { isoFields } from "./iso";
import { normalized } from "./text";
import { timeIn } from "./time";

const ONE = 1;
const NONE = 0;
const DIGIT_RUNS = /\d+/gu;
const WORD_MINIMUMS = { all: 3, own: 1 } as const;
// "日" is a Japanese weekday and part of every Japanese date
const WEEKDAY_MINIMUMS = { all: 3, own: 2 } as const;

/** What a parse reads with: the words of all and of the own locale. */
type Context = Readonly<{
  locales: Locales;
  options: ParseOptions;
  own: Words | undefined;
  words: Words;
}>;

// Word indexes are built once per set of locales and per own locale
const INDEXES = new WeakMap<Locales, Words>();
const OWN_INDEXES = new WeakMap<LocaleData, Words>();

function indexOf(locales: Locales): Words {
  const cached = INDEXES.get(locales) ?? wordsOf(Object.values(locales));
  INDEXES.set(locales, cached);
  return cached;
}

function ownIndexOf(
  locales: Locales,
  tag: string | undefined
): Words | undefined {
  if (tag === undefined) {
    return undefined;
  }
  const data = localeFor(locales, tag);
  if (data === undefined) {
    return undefined;
  }
  const cached = OWN_INDEXES.get(data) ?? wordsOf([data]);
  OWN_INDEXES.set(data, cached);
  return cached;
}

function tablesOf(context: Context, kind: keyof Words): Tables {
  if (context.own === undefined) {
    return { all: context.words[kind], own: undefined };
  }
  return { all: context.words[kind], own: context.own[kind] };
}

// With a known locale only its own weekdays count: "tháng" is no weekday
function weekdayTables(context: Context): Tables {
  if (context.own === undefined) {
    return tablesOf(context, "weekdays");
  }
  return { all: context.own.weekdays, own: undefined };
}

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

// A BC era word turns the years before the common era (1 BC is year 0)
function withEra(
  readings: readonly Reading[],
  rest: string,
  context: Context
): Reading[] {
  const era = findWord(rest, tablesOf(context, "eras"), WORD_MINIMUMS);
  if (era === undefined || !era.values.has(BC)) {
    return [...readings];
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
  return withEra(
    namedReadings(groups, index + ONE, reference),
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

// The whole text at midnight, when it holds no time
function untimed(text: string): TimeOfDay {
  return {
    hour: MIDNIGHT.hour,
    millisecond: MIDNIGHT.millisecond,
    minute: MIDNIGHT.minute,
    offsetMinutes: MIDNIGHT.offsetMinutes,
    rest: text,
    second: MIDNIGHT.second,
    valid: true,
  };
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
    return undefined;
  }
  const reading: Reading = {
    day: fields.day,
    month: fields.month,
    order: "YMD",
    year: fields.year,
  };
  const problem = problemOf(reading);
  if (problem === undefined) {
    return success(reading, fields);
  }
  if (text.includes("-")) {
    return failure([problem]);
  }
  return undefined;
}

function contextOf(locales: Locales, options: ParseOptions): Context {
  return {
    locales,
    options,
    own: ownIndexOf(locales, options.locale),
    words: indexOf(locales),
  };
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
