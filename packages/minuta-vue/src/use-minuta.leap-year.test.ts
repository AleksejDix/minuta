import { describe, expect, it } from "vitest";
import type { PlainDate } from "@aleksejdix/minuta";
import { date } from "#src/test/temporal";
import { useMinuta } from "./use-minuta";

const DAYS_IN_LEAP_YEAR = 366;
const ONE_DAY = 1;

type LeapYearCase = Readonly<{
  label: string;
  targetDate: PlainDate;
}>;

const leapYearDates: readonly LeapYearCase[] = Array.from(
  { length: DAYS_IN_LEAP_YEAR },
  (_value, index) => {
    const targetDate = date("2024-01-01").add({ days: index });
    return { label: targetDate.toString(), targetDate };
  }
);

describe("useMinuta() browsing across a leap year", () => {
  it.each(leapYearDates)(
    "browses the day $label",
    { timeout: 5000 },
    ({ targetDate }) => {
      expect.hasAssertions();
      const minuta = useMinuta({
        date: date("2024-01-01"),
        unit: "day",
      });

      minuta.browse(minuta.day(targetDate));

      const { end, start } = minuta.browsing.value;
      // The day starts on its date and ends where the next one starts
      expect(start.toString()).toBe(targetDate.toString());
      expect(end.toString()).toBe(targetDate.add({ days: ONE_DAY }).toString());
    }
  );
});
