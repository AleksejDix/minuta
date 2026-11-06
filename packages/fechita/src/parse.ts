/**
 * The rules of parseDateWith: recognise the date in text whatever its form,
 * report every way it can be read, and pick one only when the text, the
 * order or the locale leaves no doubt.
 */

import type { Locales, ParseOptions } from "./types";
import { chosen, failure } from "./choose";
import { contextOf, tablesOf } from "./context";
import { datesIn, weekdayFits } from "./dates-in";
import type { Context } from "./context";
import type { ParseResult } from "./choose";
import { normalized } from "./text";
import { parseIso } from "./iso";
import { timeIn } from "./time";

/**
 * The date in text that is not ISO 8601: times, month and weekday names,
 * eras and numbers in any order.
 *
 * @param text - Normalised text
 * @param context - Words and options
 * @returns The result
 */
function parseFree(text: string, context: Context): ParseResult {
  const { clock, problem, rest } = timeIn(text, tablesOf(context, "periods"));
  if (problem !== undefined) {
    return failure([problem]);
  }
  const { month, readings } = datesIn(rest, context);
  if (typeof readings === "string") {
    return failure([readings]);
  }
  const result = chosen(readings, clock, context);
  if (result.valid && !weekdayFits(result.parts, { month, rest }, context)) {
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
 * import { withLocales } from "@aleksejdix/fechita/core";
 * import { de } from "@aleksejdix/fechita/locales/de";
 * import { en } from "@aleksejdix/fechita/locales/en";
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
