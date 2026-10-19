import { DateProblem, checkDate } from "./rules";
import { deriveFormat, parseSegments } from "./parse";
import { describe, expect, it } from "vitest";

const DATE = deriveFormat("de-CH");
const DATE_TIME = deriveFormat("de-CH", {
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  month: "2-digit",
  year: "numeric",
});
const SATURDAY = 6;
const SUNDAY = 0;
const YEAR_2026 = {
  max: new Date("2026-12-31T00:00"),
  min: new Date("2026-01-01T00:00"),
};

function dateOf(text: string): ReturnType<typeof parseSegments> {
  return parseSegments(DATE, text);
}

function isWeekend(date: Readonly<Date>): boolean {
  return date.getDay() === SATURDAY || date.getDay() === SUNDAY;
}

describe("checkDate() limits", () => {
  it("accepts a date inside the limits", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(checkDate(dateOf("15.06.2026"), YEAR_2026)).toBeUndefined();
  });

  it("reports a date before min and after max", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(checkDate(dateOf("31.12.2025"), YEAR_2026)).toBe(
      DateProblem.BeforeMin
    );
    expect(checkDate(dateOf("01.01.2027"), YEAR_2026)).toBe(
      DateProblem.AfterMax
    );
  });

  it("counts the days of min and max as allowed", { timeout: 5000 }, () => {
    expect.hasAssertions();
    // A min with a time of day still allows its whole day in a date field
    const rules = {
      max: new Date("2026-06-15T09:00"),
      min: new Date("2026-06-15T18:30"),
    };
    expect(checkDate(dateOf("15.06.2026"), rules)).toBeUndefined();
  });

  it("compares moments in a field with a time", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const rules = { min: new Date("2026-06-15T18:30") };
    const early = parseSegments(DATE_TIME, "15.06.2026, 18:29");
    const onTime = parseSegments(DATE_TIME, "15.06.2026, 18:30");
    expect(checkDate(early, rules)).toBe(DateProblem.BeforeMin);
    expect(checkDate(onTime, rules)).toBeUndefined();
  });

  it("reports nothing for an unfinished field", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(checkDate(dateOf("15.06.19__"), YEAR_2026)).toBeUndefined();
    expect(checkDate(dateOf("__.__.____"), YEAR_2026)).toBeUndefined();
  });
});

describe("checkDate() availability", () => {
  it("reports an unavailable date", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const rules = { isUnavailable: isWeekend };
    expect(checkDate(dateOf("13.06.2026"), rules)).toBe(
      DateProblem.Unavailable
    );
    expect(checkDate(dateOf("15.06.2026"), rules)).toBeUndefined();
  });

  it("checks the limits before availability", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const rules = {
      isUnavailable: isWeekend,
      min: new Date("2026-06-15T00:00"),
    };
    expect(checkDate(dateOf("13.06.2026"), rules)).toBe(DateProblem.BeforeMin);
  });
});
