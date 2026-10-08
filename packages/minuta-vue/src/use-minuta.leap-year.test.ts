import { describe, expect, it } from "vitest";
import { useMinuta } from "./use-minuta";

const LEAP_YEAR = 2024;
const JANUARY = 0;
const FIRST_DAY = 1;
const DAYS_IN_LEAP_YEAR = 366;
const ISO_DATE_START = 0;
const ISO_DATE_LENGTH = 10;

type LeapYearCase = Readonly<{
  label: string;
  targetDate: Readonly<Date>;
}>;

const leapYearDates: readonly LeapYearCase[] = Array.from(
  { length: DAYS_IN_LEAP_YEAR },
  (_value, index) => {
    const targetDate = new Date(LEAP_YEAR, JANUARY, FIRST_DAY + index);
    return {
      label: targetDate.toISOString().slice(ISO_DATE_START, ISO_DATE_LENGTH),
      targetDate,
    };
  }
);

/**
 * Picks the local calendar fields of a date.
 *
 * @param date - The date to read
 * @returns Its local year, month and day of month
 */
function calendarFields(
  date: Readonly<Date>
): Readonly<Record<string, number>> {
  return {
    date: date.getDate(),
    month: date.getMonth(),
    year: date.getFullYear(),
  };
}

describe("useMinuta() browsing across a leap year", () => {
  it.each(leapYearDates)(
    "browses the day $label",
    { timeout: 5000 },
    ({ targetDate }) => {
      expect.hasAssertions();
      const minuta = useMinuta({
        date: new Date("2024-01-01T00:00:00"),
        unit: "day",
      });

      minuta.browse(minuta.period(targetDate, "day"));

      const { end, start } = minuta.browsing.value;
      expect(start.getTime()).toBe(targetDate.getTime());
      expect(calendarFields(start)).toStrictEqual(calendarFields(targetDate));
      expect(calendarFields(end)).toStrictEqual(calendarFields(targetDate));
    }
  );
});
