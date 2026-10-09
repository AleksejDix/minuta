/**
 * Recognise a pasted date in any common form, so it can be written into a
 * field of any format: ISO 8601, month names, and numbers in any order.
 */

import { dateOf, fullYear } from "./year";
import type { DateFormat } from "./types";
import { slotChar } from "input-state";

const MONTHS = 12;
const MAX_DAY = 31;
const FOUR_DIGITS = 4;
const TWO_DIGITS = 2;
const MONTH_OFFSET = 1;
const MIN_NAME_LENGTH = 3;
const ENGLISH = "en";
// Any year: only the month names are read from it
const REFERENCE_YEAR = 2000;

const ISO_DATE = /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})$/u;
const ISO_INSTANT = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/u;
const DIGIT_RUN = /\d+/gu;
const WORD = /\p{L}+/gu;
const ANY_DIGIT = /\p{Nd}/gu;

type Parts = Readonly<{ day: number; month: number; year: number }>;

function asciiDigits(text: string): string {
  return text.replaceAll(
    ANY_DIGIT,
    (digit) => slotChar("digit", digit) ?? digit
  );
}

/**
 * The date of `parts` if it exists (31 April does not).
 *
 * @param parts - Day, month (1-12) and full year
 * @returns The local date at midnight, or undefined
 */
function validDate(parts: Parts): Date | undefined {
  const { day, month, year } = parts;
  if (month < MONTH_OFFSET || month > MONTHS || day < MONTH_OFFSET) {
    return undefined;
  }
  const date = dateOf(year, month - MONTH_OFFSET, day);
  if (date.getDate() !== day || date.getMonth() !== month - MONTH_OFFSET) {
    return undefined;
  }
  return date;
}

function yearOf(group: string): number {
  return fullYear(Number(group), group.length);
}

function monthNames(locale: string): ReadonlyMap<string, number> {
  const names = new Map<string, number>();
  for (const style of ["long", "short"] as const) {
    const format = new Intl.DateTimeFormat(locale, { month: style });
    for (let month = 0; month < MONTHS; month += MONTH_OFFSET) {
      const name = format.format(dateOf(REFERENCE_YEAR, month, MONTH_OFFSET));
      names.set(name.replaceAll(".", "").toLowerCase(), month + MONTH_OFFSET);
    }
  }
  return names;
}

function localesFor(locale: string | undefined): readonly string[] {
  if (locale === undefined) {
    return [ENGLISH];
  }
  return [locale, ENGLISH];
}

/**
 * The month named in `text`, in `locale` or English ("März", "Mar", "March").
 *
 * @param text - The pasted text
 * @param locale - The field's locale, if known
 * @returns The month (1-12), or undefined
 */
function namedMonth(
  text: string,
  locale: string | undefined
): number | undefined {
  const locales = localesFor(locale);
  const words = (text.match(WORD) ?? [])
    .map((word) => word.toLowerCase())
    .filter((word) => word.length >= MIN_NAME_LENGTH);
  for (const name of locales) {
    const names = monthNames(name);
    for (const word of words) {
      const month = names.get(word);
      if (month !== undefined) {
        return month;
      }
    }
  }
  return undefined;
}

function withNamedMonth(
  groups: readonly string[],
  month: number
): Parts | undefined {
  const year = groups.find((group) => group.length === FOUR_DIGITS);
  const day = groups.find(
    (group) => group !== year && Number(group) <= MAX_DAY
  );
  if (year === undefined || day === undefined) {
    return undefined;
  }
  return { day: Number(day), month, year: yearOf(year) };
}

// Whether the field shows the day before the month (de-CH) or after (en-US)
function dayFirst(format: Readonly<DateFormat>): boolean {
  const day = format.findIndex((token) => token.type === "day");
  const month = format.findIndex((token) => token.type === "month");
  return day < month;
}

/**
 * Day and month from two numbers: one above 12 can only be the day,
 * otherwise the field's own order decides.
 *
 * @param first - The earlier number
 * @param second - The later number
 * @param format - The field's format
 * @returns Day and month
 */
function dayAndMonth(
  first: number,
  second: number,
  format: Readonly<DateFormat>
): Readonly<{ day: number; month: number }> {
  if (first > MONTHS || (second <= MONTHS && dayFirst(format))) {
    return { day: first, month: second };
  }
  return { day: second, month: first };
}

function fromNumbers(
  groups: readonly string[],
  format: Readonly<DateFormat>
): Parts | undefined {
  const [first, second, third] = groups;
  if (first === undefined || second === undefined || third === undefined) {
    return undefined;
  }
  if (first.length === FOUR_DIGITS) {
    return { day: Number(third), month: Number(second), year: yearOf(first) };
  }
  const { day, month } = dayAndMonth(Number(first), Number(second), format);
  if (third.length !== FOUR_DIGITS && third.length !== TWO_DIGITS) {
    return undefined;
  }
  return { day, month, year: yearOf(third) };
}

function partsFrom(
  groups: readonly string[],
  month: number | undefined,
  format: Readonly<DateFormat>
): Parts | undefined {
  if (month === undefined) {
    return fromNumbers(groups, format);
  }
  return withNamedMonth(groups, month);
}

function isoDate(text: string): Date | undefined {
  const groups = ISO_DATE.exec(text);
  if (groups !== null && groups.groups !== undefined) {
    return validDate({
      day: Number(groups.groups["day"]),
      month: Number(groups.groups["month"]),
      year: Number(groups.groups["year"]),
    });
  }
  if (ISO_INSTANT.test(text)) {
    const instant = new Date(text);
    if (!Number.isNaN(instant.getTime())) {
      return dateOf(
        instant.getFullYear(),
        instant.getMonth(),
        instant.getDate()
      );
    }
  }
  return undefined;
}

/**
 * The date in pasted text, whatever its format: ISO 8601 (a timestamp is
 * read in the local time zone), a month name in `locale` or English, or
 * three numbers in any order, where a four-digit number is the year and a
 * number above 12 the day; an ambiguous day and month follow `format`.
 *
 * @example
 * recognizeDate("2026-03-31", deriveFormat("de-CH")); // 31 March 2026
 * recognizeDate("3/31/2026", deriveFormat("de-CH")); // 31 March 2026
 * recognizeDate("31. März 2026", deriveFormat("de-CH"), "de-CH"); // 31 March 2026
 * recognizeDate("04/05/2026", deriveFormat("de-CH")); // 4 May 2026
 *
 * @param text - Pasted text
 * @param format - The field's format, for the order of ambiguous parts
 * @param locale - The field's locale, for month names (English always works)
 * @returns The date at local midnight, or undefined when none is recognised
 */
function recognizeDate(
  text: string,
  format: Readonly<DateFormat>,
  locale?: string
): Date | undefined {
  const clean = asciiDigits(text.trim());
  const iso = isoDate(clean);
  if (iso !== undefined) {
    return iso;
  }
  const groups = clean.match(DIGIT_RUN) ?? [];
  const month = namedMonth(clean, locale);
  const parts = partsFrom(groups, month, format);
  if (parts === undefined) {
    return undefined;
  }
  return validDate(parts);
}

export { recognizeDate };
