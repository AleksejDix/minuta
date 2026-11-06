import { ParseError, parseDate } from "#src/index";
import { describe, expect, it } from "vitest";
import type { ParseOptions } from "#src/types";
import { Temporal } from "temporal-polyfill/full";
import { de } from "#src/locales/de";
import { en } from "#src/locales/en";
import { withLocales } from "#src/core";

const REFERENCE = Temporal.PlainDate.from("2026-01-01");
const TEN_UTC = "2026-03-31T10:00:00Z";

type Case = Readonly<{
  expected: string;
  options?: ParseOptions;
  text: string;
}>;

// The value as Temporal writes it, or the error codes
function parsedAt(
  text: string,
  options: ParseOptions = {}
): string | readonly string[] {
  const withReference: ParseOptions = { referenceDate: REFERENCE };
  const result = parseDate(text, Object.assign(withReference, options));
  if (!result.valid) {
    return result.errorCodes;
  }
  return result.value.toString();
}

function candidatesOf(text: string): string[] {
  const result = parseDate(text);
  if (result.valid) {
    return [];
  }
  return result.candidates.map((value) => value.toString());
}

function germanValueOf(text: string): string | undefined {
  const result = withLocales({ de, en }).parseDate(text);
  if (!result.valid) {
    return undefined;
  }
  return result.value.toString();
}

const DATES: readonly Case[] = [
  { expected: "2026-03-31", text: "2026-03-31" },
  { expected: "2026-03-31", text: "20260331" },
  { expected: "2026-03-31", text: "31.03.2026" },
  { expected: "2026-03-31", text: "3/31/2026" },
  { expected: "2026-03-31", text: "31. März 2026" },
  { expected: "2026-03-31", text: "MÄRZ 31 2026" },
  { expected: "2026-03-31", text: "Tuesday, March 31, 2026" },
  { expected: "2026-03-31", text: "31 de marzo de 2026" },
  { expected: "2026-03-31", text: "2026年3月31日" },
  { expected: "2026-03-31", text: "٣١/٠٣/٢٠٢٦" },
  { expected: "2026-03-31", text: "３１.０３.２０２６" },
  {
    expected: "2026-03-31",
    options: { locale: "de-CH" },
    text: "31.03.26",
  },
  { expected: "2026-03-31T14:05:00", text: "March 31, 2026 2:05 PM" },
  { expected: "2026-03-31T23:59:59", text: "2026-03-31T23:59:59" },
  { expected: "2026-03-30T10:01:00Z", text: "2026-03-31T10:00+23:59" },
  { expected: "2026-03-31T23:59:00Z", text: "2026-03-31T10:00-13:59" },
  // A decimal fraction on the last time component sets the smaller ones
  { expected: "2026-10-13T10:30:00", text: "2026-10-13T10.5" },
  { expected: "2026-10-13T10:30:00", text: "2026-10-13T10,5" },
  { expected: "2026-10-13T10:15:00", text: "2026-10-13T10.25" },
  { expected: "2026-10-13T10:04:30", text: "2026-10-13T10:04.5" },
  { expected: "2026-10-13T10:04:30", text: "2026-10-13T10:04,5" },
  { expected: "2026-10-13T10:04:30", text: "20261013T1004,5" },
  { expected: "2026-10-13T10:30:00Z", text: "2026-10-13T10.5Z" },
  { expected: "2026-10-13T10:04:05.123", text: "2026-10-13T10:04:05.123" },
  { expected: "2026-10-13T10:04:05.123", text: "2026-10-13T10:04:05,123" },
  { expected: "2026-03-31T14:05:00", text: "2026년 3월 31일 오후 2:05" },
  { expected: "2026-03-31T14:00:00", text: "am 31. März 2026 um 14:00" },
  {
    expected: "2026-05-04",
    options: { locale: "de-CH" },
    text: "04/05/2026",
  },
  {
    expected: "2026-04-05",
    options: { locale: "en-US" },
    text: "04/05/2026",
  },
  {
    expected: "2026-05-04",
    options: { locale: "en-GB" },
    text: "04/05/2026",
  },
  {
    expected: "2026-04-05",
    options: { order: "MDY" },
    text: "04/05/2026",
  },
  {
    expected: "2026-11-05",
    options: { locale: "pl" },
    text: "5 listopad 2026",
  },
  // Found by the comparison with other parsers: a Finnish month that starts like an English one
  { expected: "2030-11-09", text: "9. marraskuuta 2030" },
  // Day and month equal: both readings are the same day
  { expected: "2026-01-01", text: "1/1/2026" },
  { expected: "2026-05-05", text: "5/5/26" },
];

describe("parseDate() reads", () => {
  it.each(DATES)("$text", { timeout: 5000 }, ({ expected, options, text }) => {
    expect.hasAssertions();
    expect(parsedAt(text, options)).toBe(expected);
  });

  it("an offset as the exact instant", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect([
      parsedAt("2026-03-31T10:00:00Z"),
      parsedAt("Tue, 31 Mar 2026 12:00:00 +0200"),
    ]).toStrictEqual([TEN_UTC, TEN_UTC]);
  });
});

// The kind of value and the value as Temporal writes it, or the error codes
function kindOf(text: string): readonly string[] {
  const result = parseDate(text);
  if (!result.valid) {
    return result.errorCodes;
  }
  return [result.kind, result.value.toString()];
}

describe("parseDate() returns", () => {
  it("a PlainDate for a date", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(kindOf("31. März 2026")).toStrictEqual(["date", "2026-03-31"]);
  });

  it("a PlainDateTime for a date and time", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(kindOf("2026-03-31T00:00")).toStrictEqual([
      "dateTime",
      "2026-03-31T00:00:00",
    ]);
  });

  it("an Instant for a time with an offset", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(kindOf("2026-03-31T12:00+02:00")).toStrictEqual([
      "instant",
      TEN_UTC,
    ]);
  });

  it("a leap second as the second before", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(parsedAt("2016-12-31T23:59:60Z")).toBe("2016-12-31T23:59:59Z");
  });
});

describe("parseDate() reads two-digit years", () => {
  it("around the reference's ISO year", { timeout: 5000 }, () => {
    expect.hasAssertions();
    // Hebrew 5786 is ISO 2026
    const hebrew = REFERENCE.withCalendar("hebrew");
    expect(parsedAt("31.03.26", { locale: "de", referenceDate: hebrew })).toBe(
      "2026-03-31"
    );
  });
});

describe("parseDate() checks the weekday", () => {
  it("of the written day, whatever the offset", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(parsedAt("Tuesday, March 31, 2026 23:30 -05:00")).toBe(
      "2026-04-01T04:30:00Z"
    );
  });
});

const ERRORS: readonly Case[] = [
  { expected: ParseError.AmbiguousDayMonth, text: "04/05/2026" },
  { expected: ParseError.AmbiguousDayMonth, text: "01022026" },
  { expected: ParseError.AmbiguousMonth, text: "5 listopad 2026" },
  { expected: ParseError.InvalidDay, text: "2026-02-29" },
  { expected: ParseError.InvalidDay, text: "31 April 2026" },
  { expected: ParseError.InvalidMonth, text: "2026-13-01" },
  { expected: ParseError.InvalidTime, text: "31.03.2026 25:00" },
  { expected: ParseError.InvalidTime, text: "2026-03-31T25:00" },
  { expected: ParseError.InvalidTime, text: "2026-03-31T10:61" },
  { expected: ParseError.InvalidTime, text: "2026-03-31T10:00:61" },
  { expected: ParseError.InvalidTime, text: "2026-03-31T24:00" },
  { expected: ParseError.InvalidTime, text: "20260331T250000" },
  { expected: ParseError.InvalidTime, text: "2026-03-31T24.5" },
  { expected: ParseError.InvalidTime, text: "2026-03-31T10:60.5" },
  { expected: ParseError.InvalidOffset, text: "2026-03-31T10:00+25:00" },
  { expected: ParseError.InvalidOffset, text: "2026-03-31T10:00+10:75" },
  { expected: ParseError.InvalidOffset, text: "31.03.2026 10:00 +25:00" },
  { expected: ParseError.NoDate, text: "hello" },
  { expected: ParseError.WeekdayMismatch, text: "Monday, March 31, 2026" },
];

const ERAS: readonly Readonly<{ text: string; year: number }>[] = [
  { text: "15. März 44 v. Chr.", year: -43 },
  { text: "15 March 500 BC", year: -499 },
  { text: "15 March 2026 AD", year: 2026 },
];

function yearOf(text: string): number | undefined {
  const result = parseDate(text);
  if (!result.valid) {
    return undefined;
  }
  return result.parts.year;
}

describe("parseDate() reads eras", () => {
  it.each(ERAS)("$text as year $year", { timeout: 5000 }, ({ text, year }) => {
    expect.hasAssertions();
    expect(yearOf(text)).toBe(year);
  });
});

describe("parseDate() reports", () => {
  it.each(ERRORS)(
    "$expected for $text",
    { timeout: 5000 },
    ({ expected, text }) => {
      expect.hasAssertions();
      expect(parsedAt(text)).toContain(expected);
    }
  );

  it("both candidates of an ambiguous date", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(candidatesOf("04/05/2026")).toStrictEqual([
      "2026-05-04",
      "2026-04-05",
    ]);
  });
});

describe("withLocales()", () => {
  it("reads only the words of the given locales", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { parseDate: parseGerman } = withLocales({ de, en });
    expect([
      parseGerman("31. März 2026").valid,
      parseGerman("31 марта 2026").valid,
      parseDate("31 марта 2026").valid,
    ]).toStrictEqual([true, false, true]);
  });

  it("returns the same dates as the default entry", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(germanValueOf("31. März 2026")).toBe("2026-03-31");
  });
});
