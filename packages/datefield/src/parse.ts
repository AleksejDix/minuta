import type { DateFormat, FormatToken, Segment, SegmentType } from "./types";
import { REFERENCE_DATE, clockOf, clockToken, withShortPeriods } from "./clock";
import type { ClockInfo } from "./clock";
import { withMeta } from "./segment";

const PLACEHOLDER = "_";

/**
 * Intl part types mapped to our SegmentType.
 */
const INTL_TYPE_MAP: Readonly<Partial<Record<string, SegmentType>>> = {
  day: "day",
  dayPeriod: "dayPeriod",
  era: "era",
  fractionalSecond: "fractionalSecond",
  hour: "hour",
  literal: "literal",
  minute: "minute",
  month: "month",
  second: "second",
  timeZoneName: "timeZoneName",
  weekday: "weekday",
  year: "year",
};

const DEFAULT_OPTIONS: Readonly<Intl.DateTimeFormatOptions> = {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
};

function partToToken(
  part: Readonly<Intl.DateTimeFormatPart>,
  clock: ClockInfo
): FormatToken | undefined {
  const type = INTL_TYPE_MAP[part.type];
  if (type === undefined) {
    return undefined;
  }
  if (type === "literal") {
    return { char: part.value, type: "literal" };
  }
  if (
    type === "dayPeriod" ||
    (type === "hour" && clock.hourCycle !== undefined)
  ) {
    return clockToken(type, part.value.length, clock);
  }
  return { length: part.value.length, type };
}

function tokenLength(token: Readonly<FormatToken>): number {
  if (token.type === "literal") {
    return token.char.length;
  }
  return token.length;
}

/**
 * Derive a DateFormat from a locale using Intl.DateTimeFormat.formatToParts().
 *
 * This is the primary way to create a format — no format strings needed.
 * The browser knows the correct segment order and separators for any locale.
 *
 * Pass Intl.DateTimeFormatOptions to control which parts appear.
 * Defaults to date-only: { day: "2-digit", month: "2-digit", year: "numeric" }.
 *
 * @example
 * deriveFormat("de-CH")  // DD.MM.YYYY (day.month.year)
 * deriveFormat("en-US")  // MM/DD/YYYY (month/day/year)
 * deriveFormat("en-US", { hour: "2-digit", minute: "2-digit" })
 * deriveFormat("en-US", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric" })
 * @param locale - BCP 47 locale
 * @param options - Intl options selecting the parts
 * @returns The format tokens
 */
function deriveFormat(
  locale: string,
  options?: Readonly<Intl.DateTimeFormatOptions>
): DateFormat {
  const intlLocale = new Intl.Locale(locale, {
    calendar: "gregory",
    numberingSystem: "latn",
  });

  const fmt = new Intl.DateTimeFormat(
    intlLocale.toString(),
    withShortPeriods(options ?? DEFAULT_OPTIONS)
  );
  const clock = clockOf(fmt);
  const tokens: DateFormat = [];

  for (const part of fmt.formatToParts(REFERENCE_DATE)) {
    const token = partToToken(part, clock);
    if (token !== undefined) {
      tokens.push(token);
    }
  }

  return tokens;
}

// The segment `token` describes, at `pos`, holding `value`
function segmentOf(
  token: Readonly<FormatToken>,
  pos: number,
  value: string
): Segment {
  const end = pos + value.length;
  if (token.type === "literal") {
    return { end, start: pos, type: "literal", value };
  }
  return withMeta(token, { end, start: pos, type: token.type, value });
}

/**
 * Parse a date string into segments based on a format.
 *
 * @example
 * const format = deriveFormat("de-CH")
 * parseSegments(format, "31.03.2026")
 * // [
 * //   { type: "day", value: "31", start: 0, end: 2 },
 * //   { type: "literal", value: ".", start: 2, end: 3 },
 * //   { type: "month", value: "03", start: 3, end: 5 },
 * //   { type: "literal", value: ".", start: 5, end: 6 },
 * //   { type: "year", value: "2026", start: 6, end: 10 },
 * // ]
 * @param format - Format to parse with
 * @param text - Date string
 * @returns The segments
 */
function parseSegments(format: Readonly<DateFormat>, text: string): Segment[] {
  const segments: Segment[] = [];
  let pos = 0;

  for (const token of format) {
    const length = tokenLength(token);
    segments.push(segmentOf(token, pos, text.slice(pos, pos + length)));
    pos += length;
  }

  return segments;
}

/**
 * Build a placeholder string from a format (e.g. "__.__.____").
 *
 * @param format - Format to describe
 * @returns The placeholder string
 */
function placeholder(format: Readonly<DateFormat>): string {
  return format
    .map((token) => {
      if (token.type === "literal") {
        return token.char;
      }
      return PLACEHOLDER.repeat(token.length);
    })
    .join("");
}

/**
 * Get the expected total length of a formatted string.
 *
 * @param format - Format to measure
 * @returns The total length
 */
function formatLength(format: Readonly<DateFormat>): number {
  let total = 0;
  for (const token of format) {
    total += tokenLength(token);
  }
  return total;
}

type DateOrder = "DMY" | "MDY" | "YMD";

const ORDER_LETTERS: Readonly<Record<string, string>> = {
  day: "D",
  month: "M",
  year: "Y",
};
const ORDERS: ReadonlySet<string> = new Set(["DMY", "MDY", "YMD"]);
const DEFAULT_ORDER: DateOrder = "DMY";

function isDateOrder(letters: string): letters is DateOrder {
  return ORDERS.has(letters);
}

/**
 * The order of day, month and year in a format, e.g. to tell a date parser
 * how to read an ambiguous paste (fechita's `order` option).
 *
 * @example
 * dateOrder(deriveFormat("de-CH")); // "DMY"
 * dateOrder(deriveFormat("en-US")); // "MDY"
 * dateOrder(deriveFormat("ja-JP")); // "YMD"
 *
 * @param format - Format from `deriveFormat`
 * @returns `DMY`, `MDY` or `YMD` (`DMY` for formats without all three)
 */
function dateOrder(format: Readonly<DateFormat>): DateOrder {
  const letters = format
    .map((token) => ORDER_LETTERS[token.type] ?? "")
    .join("");
  if (isDateOrder(letters)) {
    return letters;
  }
  return DEFAULT_ORDER;
}

export { dateOrder, deriveFormat, formatLength, parseSegments, placeholder };
export type { DateOrder };
