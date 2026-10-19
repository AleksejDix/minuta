import { describe, expect, it } from "vitest";
import type { DateParts } from "#src/types";
import { ParseError } from "#src/errors";
import type { ParseErrorCode } from "#src/errors";
import { parseDate } from "#src/index";

/*
 * Every date and date-time format of RFC 3339, ISO 8601-1 and the HTML
 * date/time microsyntaxes, grouped by the standards that define it. Cases
 * are written from the specs. fechita reads date-times with a date; a time
 * alone is reported as NO_DATE on purpose.
 */

type Read = Readonly<{ parts: Partial<DateParts>; text: string }>;
type Rejected = Readonly<{ code: ParseErrorCode; text: string }>;

const UTC = 0;
const PLUS_TWO = 120;
const MINUS_FIVE_THIRTY = -330;

function partsOf(text: string): DateParts | readonly ParseErrorCode[] {
  const result = parseDate(text);
  if (!result.valid) {
    return result.errorCodes;
  }
  return result.parts;
}

// `base` with the fields of `extra` added or replaced
function at(
  base: Partial<DateParts>,
  extra: Partial<DateParts>
): Partial<DateParts> {
  return Object.fromEntries([
    ...Object.entries(base),
    ...Object.entries(extra),
  ]);
}

const DAY: Partial<DateParts> = { day: 13, month: 10, year: 2026 };
const TEN_FOUR = at(DAY, { hour: 10, minute: 4 });
const TEN_FOUR_FIVE = at(TEN_FOUR, { second: 5 });

const ALL_THREE: readonly Read[] = [
  { parts: DAY, text: "2026-10-13" },
  {
    parts: at(TEN_FOUR_FIVE, { offsetMinutes: UTC }),
    text: "2026-10-13T10:04:05Z",
  },
  {
    parts: at(TEN_FOUR_FIVE, { offsetMinutes: PLUS_TWO }),
    text: "2026-10-13T10:04:05+02:00",
  },
  {
    parts: at(TEN_FOUR_FIVE, { offsetMinutes: MINUS_FIVE_THIRTY }),
    text: "2026-10-13T10:04:05-05:30",
  },
  {
    parts: at(TEN_FOUR_FIVE, { millisecond: 500, offsetMinutes: UTC }),
    text: "2026-10-13T10:04:05.5Z",
  },
];

const RFC_3339: readonly Read[] = [
  {
    parts: at(TEN_FOUR_FIVE, { offsetMinutes: UTC }),
    text: "2026-10-13t10:04:05z",
  },
  // -00:00: the offset to local time is unknown; the instant is UTC
  {
    parts: at(TEN_FOUR_FIVE, { offsetMinutes: UTC }),
    text: "2026-10-13T10:04:05-00:00",
  },
  {
    parts: at(TEN_FOUR_FIVE, { offsetMinutes: UTC }),
    text: "2026-10-13 10:04:05Z",
  },
  // A fraction may have any number of digits; milliseconds are kept
  {
    parts: at(TEN_FOUR_FIVE, { millisecond: 123, offsetMinutes: UTC }),
    text: "2026-10-13T10:04:05.1234567890Z",
  },
];

const ISO_8601: readonly Read[] = [
  { parts: DAY, text: "20261013" },
  {
    parts: at(TEN_FOUR_FIVE, { offsetMinutes: UTC }),
    text: "20261013T100405Z",
  },
  {
    parts: at(TEN_FOUR_FIVE, { offsetMinutes: PLUS_TWO }),
    text: "20261013T100405+0200",
  },
  { parts: TEN_FOUR, text: "20261013T1004" },
  {
    parts: at(TEN_FOUR_FIVE, { offsetMinutes: PLUS_TWO }),
    text: "2026-10-13T10:04:05+02",
  },
  {
    parts: at(TEN_FOUR_FIVE, { millisecond: 500, offsetMinutes: UTC }),
    text: "2026-10-13T10:04:05,5Z",
  },
  {
    parts: at(TEN_FOUR, { second: 30 }),
    text: "2026-10-13T10:04.5",
  },
  {
    parts: at(DAY, { hour: 10, minute: 30 }),
    text: "2026-10-13T10,5",
  },
  // Reduced precision: the hour alone
  {
    parts: at(DAY, { hour: 10, minute: 0 }),
    text: "2026-10-13T10",
  },
  {
    parts: at(DAY, { hour: 10, offsetMinutes: PLUS_TWO }),
    text: "2026-10-13T10+02",
  },
  // Week dates: week 1 holds January 4, weeks start on Monday
  { parts: DAY, text: "2026-W42-2" },
  { parts: DAY, text: "2026W422" },
  { parts: DAY, text: "2026-w42-2" },
  { parts: { day: 29, month: 12, year: 2025 }, text: "2026-W01-1" },
  { parts: { day: 30, month: 12, year: 2024 }, text: "2025-W01-1" },
  // 2026 starts on a Thursday and 2020 is a leap year starting on a Wednesday: 53 weeks
  { parts: { day: 28, month: 12, year: 2026 }, text: "2026-W53-1" },
  { parts: { day: 3, month: 1, year: 2021 }, text: "2020-W53-7" },
  {
    parts: at(TEN_FOUR_FIVE, { offsetMinutes: UTC }),
    text: "2026-W42-2T10:04:05Z",
  },
  { parts: TEN_FOUR, text: "2026W422T1004" },
  // Ordinal dates: the day of the year
  { parts: DAY, text: "2026-286" },
  { parts: DAY, text: "2026286" },
  { parts: { day: 1, month: 1, year: 2026 }, text: "2026-001" },
  { parts: { day: 31, month: 12, year: 2028 }, text: "2028-366" },
  {
    parts: at(TEN_FOUR_FIVE, { offsetMinutes: UTC }),
    text: "2026-286T10:04:05Z",
  },
  {
    parts: at(TEN_FOUR, { offsetMinutes: PLUS_TWO }),
    text: "2026286T1004+0200",
  },
  { parts: DAY, text: "+002026-286" },
  // Expanded years, astronomical numbering: -0044 is 45 BC
  { parts: DAY, text: "+002026-10-13" },
  { parts: { day: 15, month: 3, year: -44 }, text: "-000044-03-15" },
];

const HTML: readonly Read[] = [
  { parts: TEN_FOUR, text: "2026-10-13T10:04" },
  { parts: TEN_FOUR, text: "2026-10-13 10:04" },
  {
    parts: at(TEN_FOUR, { offsetMinutes: PLUS_TWO }),
    text: "2026-10-13T10:04+02:00",
  },
];

const REJECTED: readonly Rejected[] = [
  // ISO allows 24:00 as the end of a day; fechita reads it as an error (#150)
  { code: ParseError.InvalidTime, text: "2026-10-13T24:00" },
  { code: ParseError.InvalidTime, text: "2026-10-13T24:00:00" },
  // Malformed: a decimal sign without digits
  { code: ParseError.InvalidTime, text: "2026-10-13T10:04:05.Z" },
  // Week dates: 2025 has 52 weeks; weekdays are 1–7
  { code: ParseError.InvalidWeek, text: "2025-W53-1" },
  { code: ParseError.InvalidWeek, text: "2026-W00-1" },
  { code: ParseError.InvalidWeek, text: "2026-W54-1" },
  { code: ParseError.InvalidDay, text: "2026-W42-0" },
  { code: ParseError.InvalidDay, text: "2026-W42-8" },
  { code: ParseError.InvalidTime, text: "2026-W42-2T25:00" },
  { code: ParseError.InvalidTime, text: "2026-W42-2T10:04:05.Z" },
  // Ordinal dates: 2026 has 365 days
  { code: ParseError.InvalidDay, text: "2026-366" },
  { code: ParseError.InvalidDay, text: "2026-000" },
  { code: ParseError.InvalidDay, text: "2026366" },
  { code: ParseError.InvalidTime, text: "2026-286T25:00" },
  { code: ParseError.InvalidTime, text: "2026-286T10:04:05.Z" },
  // A time alone: fechita reads dates
  { code: ParseError.NoDate, text: "10:04" },
  { code: ParseError.NoDate, text: "10:04:05Z" },
  { code: ParseError.NoDate, text: "T10:04" },
];

describe.each([
  ["RFC 3339, ISO 8601 and HTML", ALL_THREE],
  ["RFC 3339", RFC_3339],
  ["ISO 8601", ISO_8601],
  ["HTML", HTML],
])("%s", (_name, cases) => {
  it.each(cases)("reads $text", { timeout: 5000 }, ({ parts, text }) => {
    expect.hasAssertions();
    expect(partsOf(text)).toMatchObject(parts);
  });
});

describe("rejected", () => {
  it.each(REJECTED)("$text with $code", { timeout: 5000 }, ({ code, text }) => {
    expect.hasAssertions();
    expect(partsOf(text)).toStrictEqual([code]);
  });
});
