import { date, zoned } from "#src/test/temporal";
import { describe, expect, it } from "vitest";
import { periodWith, range } from "#src/operations/period";
import { createUnits } from "#src/create-units";
import { isWeekdayWith } from "./is-weekday";
import { isWeekendWith } from "./is-weekend";

const units = createUnits({ timeZone: "Europe/Zurich" });
const fridayWeekend = createUnits({ weekend: ["friday", "saturday"] });

describe("isWeekdayWith() and isWeekendWith()", () => {
  it.each([
    { day: "2026-03-16", weekday: true },
    { day: "2026-03-20", weekday: true },
    { day: "2026-03-21", weekday: false },
    { day: "2026-03-22", weekday: false },
  ] as const)(
    "$day is a weekday: $weekday, and the opposite for weekends",
    { timeout: 5000 },
    ({ day, weekday }) => {
      expect.hasAssertions();
      const period = periodWith(units, date(day), "day");
      expect(isWeekdayWith(units, period)).toBe(weekday);
      expect(isWeekendWith(units, period)).toBe(!weekday);
    }
  );

  it("follows the units' weekend", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const friday = periodWith(fridayWeekend, date("2026-03-20"), "day");
    const sunday = periodWith(fridayWeekend, date("2026-03-22"), "day");
    expect(isWeekendWith(fridayWeekend, friday)).toBe(true);
    expect(isWeekdayWith(fridayWeekend, sunday)).toBe(true);
  });
});

describe("isWeekdayWith() and isWeekendWith(): longer periods", () => {
  it("checks every day a longer period touches", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const saturdayAndSunday = range(date("2026-03-21"), date("2026-03-23"));
    const week = periodWith(units, date("2026-03-18"), "week");
    expect(isWeekendWith(units, saturdayAndSunday)).toBe(true);
    expect(isWeekdayWith(units, week)).toBe(false);
    expect(isWeekendWith(units, week)).toBe(false);
  });

  it(
    "reads the days of a time period in its own zone",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      // Saturday 08:00 in Tokyo is still Friday in Zurich, but the period is Tokyo's
      const morning = periodWith(
        units,
        zoned("2026-03-21T08:00[Asia/Tokyo]"),
        "hour"
      );
      const untilMidnight = range(
        zoned("2026-03-20T22:00[Europe/Zurich]"),
        zoned("2026-03-21T00:00[Europe/Zurich]")
      );
      expect(isWeekendWith(units, morning)).toBe(true);
      expect(isWeekdayWith(units, untilMidnight)).toBe(true);
    }
  );
});
