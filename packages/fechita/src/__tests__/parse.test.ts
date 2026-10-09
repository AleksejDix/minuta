import { ParseError, parseDate } from "#src/index";
import { describe, expect, it } from "vitest";
import type { ParseOptions } from "#src/types";
import { de } from "#src/locales/de";
import { en } from "#src/locales/en";
import { withLocales } from "#src/core";

const REFERENCE = new Date("2026-01-01T00:00");
const MARCH_31 = new Date("2026-03-31T00:00");
const TEN_UTC = new Date("2026-03-31T10:00:00Z").getTime();

type Case = Readonly<{
  expected: string;
  options?: ParseOptions;
  text: string;
}>;

function parsedAt(
  text: string,
  options: ParseOptions = {}
): number | readonly string[] {
  const withReference: ParseOptions = { referenceDate: REFERENCE };
  const result = parseDate(text, Object.assign(withReference, options));
  if (!result.valid) {
    return result.errorCodes;
  }
  return result.date.getTime();
}

function candidatesOf(text: string): number[] {
  const result = parseDate(text);
  if (result.valid) {
    return [];
  }
  return result.candidates.map((date: Readonly<Date>) => date.getTime());
}

function germanTimeOf(text: string): number | undefined {
  const result = withLocales({ de, en }).parseDate(text);
  if (!result.valid) {
    return undefined;
  }
  return result.date.getTime();
}

const DATES: readonly Case[] = [
  { expected: "2026-03-31T00:00", text: "2026-03-31" },
  { expected: "2026-03-31T00:00", text: "20260331" },
  { expected: "2026-03-31T00:00", text: "31.03.2026" },
  { expected: "2026-03-31T00:00", text: "3/31/2026" },
  { expected: "2026-03-31T00:00", text: "31. März 2026" },
  { expected: "2026-03-31T00:00", text: "MÄRZ 31 2026" },
  { expected: "2026-03-31T00:00", text: "Tuesday, March 31, 2026" },
  { expected: "2026-03-31T00:00", text: "31 de marzo de 2026" },
  { expected: "2026-03-31T00:00", text: "2026年3月31日" },
  { expected: "2026-03-31T00:00", text: "٣١/٠٣/٢٠٢٦" },
  { expected: "2026-03-31T00:00", text: "３１.０３.２０２６" },
  {
    expected: "2026-03-31T00:00",
    options: { locale: "de-CH" },
    text: "31.03.26",
  },
  { expected: "2026-03-31T14:05", text: "March 31, 2026 2:05 PM" },
  { expected: "2026-03-31T14:05", text: "2026년 3월 31일 오후 2:05" },
  { expected: "2026-03-31T14:00", text: "am 31. März 2026 um 14:00" },
  {
    expected: "2026-05-04T00:00",
    options: { locale: "de-CH" },
    text: "04/05/2026",
  },
  {
    expected: "2026-04-05T00:00",
    options: { locale: "en-US" },
    text: "04/05/2026",
  },
  {
    expected: "2026-05-04T00:00",
    options: { locale: "en-GB" },
    text: "04/05/2026",
  },
  {
    expected: "2026-04-05T00:00",
    options: { order: "MDY" },
    text: "04/05/2026",
  },
  {
    expected: "2026-11-05T00:00",
    options: { locale: "pl" },
    text: "5 listopad 2026",
  },
  // Found by the comparison with other parsers: a Finnish month that starts like an English one
  { expected: "2030-11-09T00:00", text: "9. marraskuuta 2030" },
  // Day and month equal: both readings are the same day
  { expected: "2026-01-01T00:00", text: "1/1/2026" },
  { expected: "2026-05-05T00:00", text: "5/5/26" },
];

describe("parseDate() reads", () => {
  it.each(DATES)("$text", { timeout: 5000 }, ({ expected, options, text }) => {
    expect.hasAssertions();
    expect(parsedAt(text, options)).toBe(new Date(expected).getTime());
  });

  it("an offset as the exact instant", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect([
      parsedAt("2026-03-31T10:00:00Z"),
      parsedAt("Tue, 31 Mar 2026 12:00:00 +0200"),
    ]).toStrictEqual([TEN_UTC, TEN_UTC]);
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
      new Date("2026-05-04T00:00").getTime(),
      new Date("2026-04-05T00:00").getTime(),
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
    expect(germanTimeOf("31. März 2026")).toBe(MARCH_31.getTime());
  });
});
