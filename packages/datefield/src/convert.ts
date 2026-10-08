import type {
  DateFormat,
  EditableSegmentType,
  FormatToken,
  Segment,
} from "./types";
import { extractDerivedPart } from "./derived-part";

const DEFAULT_TIME_PART = 0;
const MONTH_OFFSET = 1;
const ZERO_PAD = "0";
const DIGITS = /^\d+$/u;

type DateParts = Partial<Record<EditableSegmentType, number>>;

type DatePartGetter = (date: Readonly<Date>) => number;

const EDITABLE_GETTERS: Readonly<Record<EditableSegmentType, DatePartGetter>> =
  {
    day: (date) => date.getDate(),
    hour: (date) => date.getHours(),
    minute: (date) => date.getMinutes(),
    month: (date) => date.getMonth() + MONTH_OFFSET,
    second: (date) => date.getSeconds(),
    year: (date) => date.getFullYear(),
  };

const DERIVED_TYPES: ReadonlySet<string> = new Set<string>([
  "era",
  "weekday",
  "dayPeriod",
  "fractionalSecond",
  "timeZoneName",
]);

function isEditableType(type: string): type is EditableSegmentType {
  return Object.hasOwn(EDITABLE_GETTERS, type);
}

/**
 * Collect the numeric value of every editable segment.
 *
 * @param segments - Segments to read
 * @returns The parts, or undefined if an editable segment is not all digits
 */
function collectParts(segments: readonly Segment[]): DateParts | undefined {
  const parts: DateParts = {};
  for (const seg of segments) {
    if (isEditableType(seg.type)) {
      if (!DIGITS.test(seg.value)) {
        return undefined;
      }
      parts[seg.type] = Number(seg.value);
    }
  }
  return parts;
}

/**
 * Check that the date did not roll over (e.g. Feb 30 → Mar 2).
 *
 * @param candidate - Date built from the parts
 * @param parts - Parts the date was built from
 * @returns True if every present part matches the date
 */
function matchesParts(
  candidate: Readonly<Date>,
  parts: Readonly<DateParts>
): boolean {
  const keys: readonly EditableSegmentType[] = [
    "year",
    "month",
    "day",
    "hour",
    "minute",
    "second",
  ];
  return keys.every((key) => {
    const expected = parts[key];
    return (
      expected === undefined || EDITABLE_GETTERS[key](candidate) === expected
    );
  });
}

function buildDate(parts: Readonly<DateParts>): Date | undefined {
  const { day, month, year } = parts;
  if (day === undefined || month === undefined || year === undefined) {
    return undefined;
  }
  const candidate = new Date(
    year,
    month - MONTH_OFFSET,
    day,
    parts.hour ?? DEFAULT_TIME_PART,
    parts.minute ?? DEFAULT_TIME_PART,
    parts.second ?? DEFAULT_TIME_PART
  );
  if (!matchesParts(candidate, parts)) {
    return undefined;
  }
  return candidate;
}

/**
 * Convert segments to a Date.
 * Returns undefined if the segments don't form a valid date.
 *
 * Editable segments (day, month, year, hour, minute, second) are parsed.
 * Derived segments (era, weekday, dayPeriod, etc.) are ignored — they're computed from the date.
 *
 * @param segments - Segments to convert
 * @returns The date, or undefined if the segments are incomplete or invalid
 */
function toDate(segments: readonly Segment[]): Date | undefined {
  const parts = collectParts(segments);
  if (parts === undefined) {
    return undefined;
  }
  return buildDate(parts);
}

type TokenInput = {
  readonly date: Readonly<Date>;
  readonly locale: string | undefined;
  readonly pos: number;
  readonly token: Readonly<FormatToken>;
};

function tokenToSegment(input: TokenInput): Segment | undefined {
  const { date, locale, pos, token } = input;
  if (token.type === "literal") {
    return {
      end: pos + token.char.length,
      start: pos,
      type: "literal",
      value: token.char,
    };
  }
  if (isEditableType(token.type)) {
    const value = String(EDITABLE_GETTERS[token.type](date)).padStart(
      token.length,
      ZERO_PAD
    );
    return { end: pos + token.length, start: pos, type: token.type, value };
  }
  if (DERIVED_TYPES.has(token.type)) {
    const value = extractDerivedPart({
      date,
      length: token.length,
      locale,
      type: token.type,
    });
    return { end: pos + value.length, start: pos, type: token.type, value };
  }
  return undefined;
}

/**
 * Convert a Date to segments matching a format.
 *
 * Handles editable segments (day, month, year, hour, minute, second)
 * and derived segments (era, weekday, dayPeriod, fractionalSecond, timeZoneName).
 *
 * @param date - Date to convert
 * @param format - Format of the segments
 * @param locale - Locale for derived segments (defaults to en-US)
 * @returns The segments
 */
function fromDate(
  date: Readonly<Date>,
  format: Readonly<DateFormat>,
  locale?: string
): Segment[] {
  let pos = 0;
  const segments: Segment[] = [];

  for (const token of format) {
    const segment = tokenToSegment({ date, locale, pos, token });
    if (segment !== undefined) {
      segments.push(segment);
      pos = segment.end;
    }
  }

  return segments;
}

/**
 * Concatenate segment values into a display string.
 *
 * @param segments - Segments to join
 * @returns The display string
 */
function segmentsToString(segments: readonly Segment[]): string {
  return segments.map((seg) => seg.value).join("");
}

export { fromDate, segmentsToString, toDate };
