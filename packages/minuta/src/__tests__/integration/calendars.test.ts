import {
  count,
  createUnits,
  divide,
  month,
  period,
  toLocaleString,
  withUnits,
  year,
} from "#src/index";
import { describe, expect, it } from "vitest";
import type { DatePeriod } from "#src/types";
import { getTemporal } from "#src/temporal-api";

const LEAP_YEAR = 5784;
const COMMON_YEAR = 5785;
const LONG_MONTH = 30;
const SHORT_MONTH = 29;
const GRID_DAYS = 42;
const QUARTERS = 4;
const SATURDAY = 6;
const THIRTEEN = 13;
const TWELVE = 12;
const TWO = 2;
const FIRST = 0;
const LAST = -1;

const today = getTemporal().PlainDate.from("2026-03-18");
const hijri = withUnits(createUnits({ calendar: "islamic-umalqura" }));

// A period's ends as ISO dates, without the calendar
function isoText(span: DatePeriod): string {
  const show = { calendarName: "never" } as const;
  return `${span.start.toString(show)}/${span.end.toString(show)}`;
}

// The month codes a period's months start with
function monthCodes(span: DatePeriod): string {
  return divide(span, "month")
    .map((piece) => piece.start.monthCode)
    .join(" ");
}

// The Hebrew year `hebrewYear`, from the month with `monthCode`
function hebrewMonth(hebrewYear: number, monthCode: string): DatePeriod {
  const first = getTemporal().PlainDate.from({
    calendar: "hebrew",
    day: 1,
    monthCode,
    year: hebrewYear,
  });
  return month(first);
}

describe("periods in the date's own calendar", () => {
  it("makes Hebrew months and years", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const adarI = hebrewMonth(LEAP_YEAR, "M05L");
    const nextYear = hebrewMonth(COMMON_YEAR, "M01");
    expect(adarI.start.calendarId).toBe("hebrew");
    expect(count(adarI, "day")).toBe(LONG_MONTH);
    expect(count(year(adarI.start), "month")).toBe(THIRTEEN);
    expect(count(year(nextYear.start), "month")).toBe(TWELVE);
  });

  it(
    "folds a leap month into its base month's quarter",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const leapYear = year(hebrewMonth(LEAP_YEAR, "M01").start);
      const quarters = divide(leapYear, "quarter");
      expect(quarters).toHaveLength(QUARTERS);
      expect(quarters.map((quarter) => monthCodes(quarter))).toStrictEqual([
        "M01 M02 M03",
        "M04 M05 M05L M06",
        "M07 M08 M09",
        "M10 M11 M12",
      ]);
    }
  );

  it(
    "keeps a Japanese year whole across an era change",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const june = getTemporal().PlainDate.from("2019-06-01");
      const year2019 = year(june.withCalendar("japanese"));
      expect(isoText(year2019)).toBe("2019-01-01/2020-01-01");
      expect(
        toLocaleString(period(year2019.start, year2019.end), "ja-JP", {
          year: "numeric",
        })
      ).toBe("平成31年～令和元年");
    }
  );
});

describe("createUnits({ calendar }): Hijri", () => {
  it("reads every date in the calendar", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const ramadan = hijri.month(today);
    expect(ramadan.start.calendarId).toBe("islamic-umalqura");
    expect(isoText(ramadan)).toBe("2026-02-18/2026-03-20");
  });

  it("divides a year into its 12 lunar months", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const months = hijri.divide(hijri.year(today), "month");
    const lengths = months.map((piece) => count(piece, "day"));
    expect(months).toHaveLength(TWELVE);
    expect(Math.min(...lengths)).toBe(SHORT_MONTH);
    expect(Math.max(...lengths)).toBe(LONG_MONTH);
  });

  it("builds month grids in the calendar", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const units = createUnits({
      calendar: "islamic-umalqura",
      weekStartsOn: "saturday",
    });
    const grid = withUnits(units).monthGrid(today);
    expect(grid.periods).toHaveLength(GRID_DAYS);
    expect(grid.periods.map((day) => day.start.dayOfWeek).at(FIRST)).toBe(
      SATURDAY
    );
    expect(grid.monthStart.calendarId).toBe("islamic-umalqura");
  });
});

describe("createUnits({ calendar }): Persian and Hebrew", () => {
  it("starts a Persian year on Nowruz", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const persian = withUnits(createUnits({ calendar: "persian" }));
    expect(isoText(persian.year(today))).toBe("2025-03-21/2026-03-21");
  });

  it("rounds to the calendar's units", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const hebrew = withUnits(createUnits({ calendar: "hebrew" }));
    const snapped = hebrew.round(today, {
      roundingIncrement: TWO,
      roundingMode: "floor",
      smallestUnit: "year",
    });
    expect(snapped.calendarId).toBe("hebrew");
    expect(snapped.monthCode).toBe("M01");
  });

  it(
    "steps from the last quarter into the next year",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const time = withUnits(createUnits({ calendar: "hebrew" }));
      const quarters = time.divide(time.year(today), "quarter");
      const after = quarters.map((quarter) => time.next(quarter).start);
      expect(after.map((start) => start.monthCode).at(LAST)).toBe("M01");
    }
  );
});

describe("formatting in the period's calendar", () => {
  it("names Hebrew and Hijri months", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const adarI = hebrewMonth(LEAP_YEAR, "M05L");
    expect(toLocaleString(adarI, "en-US")).toBe("Adar I 5784");
    expect(toLocaleString(hijri.month(today), "en-US")).toBe("Ramadan 1447 AH");
  });

  it("lets the options pick another calendar", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const adarI = hebrewMonth(LEAP_YEAR, "M05L");
    const options = { calendar: "gregory", dateStyle: "long" } as const;
    expect(toLocaleString(adarI, "en-US", options)).toBe("February 10, 2024");
  });
});
