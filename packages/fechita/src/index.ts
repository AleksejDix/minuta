/**
 * Read dates the way people write them, in every locale with modern
 * coverage in Unicode CLDR. For fewer locales and a smaller bundle, use
 * `withLocales` from `fechita/core`.
 *
 * @module fechita
 */
import type { ParseOptions } from "./types";
import type { ParseResult } from "./parse";
import { allLocales } from "./locales/all";
import { parseDateWith } from "./parse";

/**
 * Read the date in `text`: ISO 8601, RFC 2822, month and weekday names in
 * any modern locale, times with AM/PM, and numbers in any order. Returns a
 * date only when exactly one reading exists, or `order` / `locale` picks one.
 *
 * @example
 * parseDate("2026-03-31").valid; // true
 * parseDate("31. März 2026").valid; // true
 * parseDate("3/31/2026").valid; // true: 31 can only be the day
 * parseDate("04/05/2026").valid; // false: AMBIGUOUS_DAY_MONTH
 * parseDate("04/05/2026", { locale: "de-CH" }).valid; // true: 4 May
 *
 * @param text - The text to read
 * @param options - `order` or `locale` to resolve ambiguous dates
 * @returns The date, or the error codes and candidate dates
 */
function parseDate(text: string, options?: ParseOptions): ParseResult {
  return parseDateWith(allLocales, text, options);
}

export { parseDate };
export { ParseError } from "./errors";
export type { ParseErrorCode } from "./errors";
export type { ParseResult } from "./parse";
export type { DateParts, Order, ParseOptions } from "./types";
