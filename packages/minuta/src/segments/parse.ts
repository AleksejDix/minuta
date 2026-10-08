import type { DateFormat, Segment, SegmentType } from "./types";

/**
 * Intl part types mapped to our SegmentType.
 */
const INTL_TYPE_MAP: Record<string, SegmentType> = {
  day: "day",
  month: "month",
  year: "year",
  hour: "hour",
  minute: "minute",
  second: "second",
  era: "era",
  weekday: "weekday",
  dayPeriod: "dayPeriod",
  fractionalSecond: "fractionalSecond",
  timeZoneName: "timeZoneName",
  literal: "literal",
};

/**
 * A reference date that produces unambiguous parts:
 * day=13, month=11, year=2026, hour=14, minute=35, second=47 — no single-digit ambiguity.
 */
const REFERENCE_DATE = new Date(2026, 10, 13, 14, 35, 47, 123);

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
 */
export function deriveFormat(
  locale: string,
  options?: Intl.DateTimeFormatOptions
): DateFormat {
  const intlLocale = new Intl.Locale(locale, {
    calendar: "gregory",
    numberingSystem: "latn",
  });

  const opts: Intl.DateTimeFormatOptions = options ?? {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  };

  const fmt = new Intl.DateTimeFormat(intlLocale.toString(), opts);
  const parts = fmt.formatToParts(REFERENCE_DATE);
  const tokens: DateFormat = [];

  for (const part of parts) {
    const type = INTL_TYPE_MAP[part.type];
    if (!type) continue;

    if (type === "literal") {
      tokens.push({ type: "literal", char: part.value });
    } else {
      tokens.push({ type, length: part.value.length });
    }
  }

  return tokens;
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
 */
export function parseSegments(format: DateFormat, text: string): Segment[] {
  const segments: Segment[] = [];
  let pos = 0;

  for (const token of format) {
    const length = token.type === "literal" ? token.char.length : token.length;
    const value = text.slice(pos, pos + length);

    segments.push({
      type: token.type === "literal" ? "literal" : token.type,
      value,
      start: pos,
      end: pos + length,
    });

    pos += length;
  }

  return segments;
}

/**
 * Build a placeholder string from a format (e.g. "__.__.____").
 */
export function placeholder(format: DateFormat): string {
  return format
    .map((token) =>
      token.type === "literal" ? token.char : "_".repeat(token.length)
    )
    .join("");
}

/**
 * Get the expected total length of a formatted string.
 */
export function formatLength(format: DateFormat): number {
  return format.reduce(
    (sum, token) =>
      sum + (token.type === "literal" ? token.char.length : token.length),
    0
  );
}
