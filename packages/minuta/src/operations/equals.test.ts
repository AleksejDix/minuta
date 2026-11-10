import { date, zoned } from "#src/test/temporal";
import { describe, expect, it } from "vitest";
import { period, periodWith } from "./period";
import type { DatePeriod } from "#src/types";
import { compare } from "./compare";
import { createUnits } from "#src/create-units";
import { equals } from "./equals";

const units = createUnits({ timeZone: "Europe/Zurich" });
const BEFORE = -1;
const AFTER = 1;
const EQUAL = 0;

function span(from: string, to: string): DatePeriod {
  return period(date(from), date(to));
}

describe("equals()", () => {
  it("asks for the same edges and unit", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const tenDays = span("2026-03-01", "2026-03-11");
    expect(equals(tenDays, span("2026-03-01", "2026-03-11"))).toBe(true);
    expect(equals(tenDays, span("2026-03-01", "2026-03-12"))).toBe(false);
    expect(equals(tenDays, span("2026-03-02", "2026-03-11"))).toBe(false);
  });

  it(
    "tells a month from a custom span over its days",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const march = periodWith(units, date("2026-03-15"), "month");
      expect(equals(march, span("2026-03-01", "2026-04-01"))).toBe(false);
      const sameMarch = periodWith(units, date("2026-03-01"), "month");
      expect(equals(march, sameMarch)).toBe(true);
    }
  );

  it("tells calendars and zones apart", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const day = periodWith(units, date("2026-03-15"), "day");
    const hebrew = periodWith(
      units,
      date("2026-03-15").withCalendar("hebrew"),
      "day"
    );
    const zurich = periodWith(
      units,
      zoned("2026-03-15T10:00[Europe/Zurich]"),
      "hour"
    );
    const paris = periodWith(
      units,
      zoned("2026-03-15T10:00[Europe/Paris]"),
      "hour"
    );
    expect(equals(day, hebrew)).toBe(false);
    expect(equals(zurich, paris)).toBe(false);
  });
});

describe("compare()", () => {
  it("orders by start, then by end", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const monday = periodWith(units, date("2026-03-16"), "day");
    const week = periodWith(units, date("2026-03-16"), "week");
    const tuesday = periodWith(units, date("2026-03-17"), "day");
    expect(compare(monday, week)).toBe(BEFORE);
    expect(compare(tuesday, week)).toBe(AFTER);
    const sameWeek = periodWith(units, date("2026-03-20"), "week");
    expect(compare(week, sameWeek)).toBe(EQUAL);
    expect(compare(week, monday)).toBe(AFTER);
  });

  it(
    "compares a day with an hour in the hour's zone",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const day = periodWith(units, date("2026-03-15"), "day");
      const lateHour = periodWith(
        units,
        zoned("2026-03-15T23:00[Europe/Zurich]"),
        "hour"
      );
      expect(compare(day, lateHour)).toBe(BEFORE);
    }
  );
});
