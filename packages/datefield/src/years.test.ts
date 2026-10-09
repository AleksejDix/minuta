import { deriveFormat, parseSegments } from "./parse";
import { describe, expect, it } from "vitest";
import { fromDate, segmentsToString, toDate } from "./convert";
import { rotateSegment } from "./rotate";

const DE = deriveFormat("de-CH");
const DE_SHORT = deriveFormat("de-CH", {
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
});
const TODAY = new Date("2026-10-09T12:00:00");
const YEAR_SEGMENT = 4;
const UP = 1;
const LEAP_YEAR_4 = 4;
const FEBRUARY = 1;
const LEAP_DAY = 29;
const YEAR_50 = 50;
const JANUARY = 0;
const FIRST_DAY = 1;

function dateIn(year: number, monthIndex: number, day: number): Date {
  const date = new Date(year, monthIndex, day);
  date.setFullYear(year, monthIndex, day);
  return date;
}

describe("two-digit years", () => {
  it.each([
    ["31.03.26", "2026-03-31T00:00:00"],
    ["31.03.99", "1999-03-31T00:00:00"],
    ["31.03.45", "2045-03-31T00:00:00"],
  ])("reads %s as %s", { timeout: 5000 }, (text, iso) => {
    expect.hasAssertions();
    expect(toDate(parseSegments(DE_SHORT, text))).toStrictEqual(new Date(iso));
  });

  it("writes the last two digits of a date's year", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const segments = fromDate(new Date("2026-03-31T00:00:00"), DE_SHORT);
    expect(segmentsToString(segments)).toBe("31.03.26");
  });

  it("rotates an empty year to two digits", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const segments = parseSegments(DE_SHORT, "__.__.__");
    const rotated = rotateSegment(segments, YEAR_SEGMENT, UP, TODAY);
    expect(segmentsToString(rotated)).toBe("__.__.26");
  });
});

describe("years below 100", () => {
  it("reads 0050 as the year 50", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(toDate(parseSegments(DE, "01.01.0050"))).toStrictEqual(
      dateIn(YEAR_50, JANUARY, FIRST_DAY)
    );
  });

  it("knows 29 February of the year 4", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(toDate(parseSegments(DE, "29.02.0004"))).toStrictEqual(
      dateIn(LEAP_YEAR_4, FEBRUARY, LEAP_DAY)
    );
  });
});
