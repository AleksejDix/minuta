import {
  contains,
  count,
  createUnits,
  divide,
  toLocaleString,
  withUnits,
} from "#src/index";
import { describe, expect, it } from "vitest";
import type { DatePeriod } from "#src/types";
import { getTemporal } from "#src/temporal-api";

const CALENDARS: readonly string[] = [
  "buddhist",
  "chinese",
  "coptic",
  "dangi",
  "ethioaa",
  "ethiopic",
  "gregory",
  "hebrew",
  "indian",
  "islamic-civil",
  "islamic-tbla",
  "islamic-umalqura",
  "iso8601",
  "japanese",
  "persian",
  "roc",
];

const GRID_DAYS = 42;
const QUARTERS = 4;
const THIRTEEN = 13;
const FIRST = 0;
const LAST = -1;

// The month codes a period's months start with
function monthCodes(span: DatePeriod): string {
  return divide(span, "month")
    .map((month) => month.start.monthCode)
    .join(" ");
}

const today = getTemporal().PlainDate.from("2026-03-18");

describe("every built-in calendar, on native Temporal", () => {
  it.each(CALENDARS)(
    "%s: a month in the calendar",
    { timeout: 5000 },
    (calendar) => {
      expect.hasAssertions();
      const time = withUnits(createUnits({ calendar }));
      const month = time.month(today);
      expect(month.start.calendarId).toBe(calendar);
      expect(contains(month, today)).toBe(true);
      expect(time.next(month).start.equals(month.end)).toBe(true);
    }
  );

  it.each(CALENDARS)(
    "%s: a year's months and quarters",
    { timeout: 5000 },
    (calendar) => {
      expect.hasAssertions();
      const time = withUnits(createUnits({ calendar }));
      const year = time.year(today);
      const quarters = time.divide(year, "quarter");
      expect(time.divide(year, "month")).toHaveLength(year.start.monthsInYear);
      expect(quarters).toHaveLength(QUARTERS);
      expect(
        quarters.map((quarter) => quarter.start.toString()).at(FIRST)
      ).toBe(year.start.toString());
      expect(quarters.map((quarter) => quarter.end.toString()).at(LAST)).toBe(
        year.end.toString()
      );
    }
  );

  it.each(CALENDARS)(
    "%s: a month grid and a label",
    { timeout: 5000 },
    (calendar) => {
      expect.hasAssertions();
      const units = createUnits({ calendar });
      expect(withUnits(units).monthGrid(today).periods).toHaveLength(GRID_DAYS);
      expect(toLocaleString(withUnits(units).month(today), "en-US")).not.toBe(
        ""
      );
    }
  );
});

describe("years with 13 months", () => {
  it(
    "puts the Ethiopic Pagume into the fourth quarter",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const time = withUnits(createUnits({ calendar: "ethiopic" }));
      const year = time.year(today);
      expect(count(year, "month")).toBe(THIRTEEN);
      expect(
        time
          .divide(year, "quarter")
          .map((quarter) => monthCodes(quarter))
          .at(LAST)
      ).toBe("M10 M11 M12 M13");
    }
  );

  it(
    "puts a Chinese leap month into its base month's quarter",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const time = withUnits(createUnits({ calendar: "chinese" }));
      const year = time.year(getTemporal().PlainDate.from("2025-08-01"));
      expect(count(year, "month")).toBe(THIRTEEN);
      expect(
        time.divide(year, "quarter").map((quarter) => monthCodes(quarter))
      ).toStrictEqual([
        "M01 M02 M03",
        "M04 M05 M06 M06L",
        "M07 M08 M09",
        "M10 M11 M12",
      ]);
    }
  );
});
