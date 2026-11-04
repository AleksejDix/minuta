import type { DatePeriod, TimePeriod } from "#src/types";
import { date, dateTime, zoned } from "#src/test/temporal";
import { describe, expect, it } from "vitest";
import { periodWith, range } from "./period";
import { contains } from "./contains";
import { createUnits } from "#src/create-units";
import { overlaps } from "./overlaps";

const units = createUnits({ timeZone: "Europe/Zurich" });
const march = periodWith(units, date("2026-03-18"), "month");
const hour = periodWith(
  units,
  zoned("2026-03-18T10:00[Europe/Zurich]"),
  "hour"
);

function dayPeriod(value: string): DatePeriod {
  return periodWith(units, date(value), "day");
}

function hourAt(iso: string): TimePeriod {
  return periodWith(units, zoned(`${iso}[Europe/Zurich]`), "hour");
}

function tokyo(from: string, to: string): TimePeriod {
  return range(zoned(`${from}[Asia/Tokyo]`), zoned(`${to}[Asia/Tokyo]`));
}

describe("contains(): dates", () => {
  it.each([
    { inside: true, value: "2026-03-01" },
    { inside: true, value: "2026-03-31" },
    { inside: false, value: "2026-04-01" },
    { inside: false, value: "2026-02-28" },
  ] as const)(
    "the month of March contains $value: $inside",
    { timeout: 5000 },
    ({ inside, value }) => {
      expect.hasAssertions();
      expect(contains(march, date(value))).toBe(inside);
    }
  );

  it(
    "treats a date in a time period as its whole day",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const twoDays = range(
        zoned("2026-03-18T00:00[Europe/Zurich]"),
        zoned("2026-03-20T00:00[Europe/Zurich]")
      );
      expect(contains(twoDays, date("2026-03-19"))).toBe(true);
      expect(contains(hour, date("2026-03-18"))).toBe(false);
    }
  );
});

describe("contains(): moments", () => {
  it.each([
    { inside: true, value: "2026-03-18T10:00[Europe/Zurich]" },
    { inside: true, value: "2026-03-18T10:59:59.999999999[Europe/Zurich]" },
    { inside: false, value: "2026-03-18T11:00[Europe/Zurich]" },
    { inside: true, value: "2026-03-18T18:30[Asia/Tokyo]" },
  ] as const)(
    "the hour from 10:00 contains $value: $inside",
    { timeout: 5000 },
    ({ inside, value }) => {
      expect.hasAssertions();
      expect(contains(hour, zoned(value))).toBe(inside);
    }
  );

  it(
    "reads a moment in a date period by its own date",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      expect(contains(march, zoned("2026-03-31T23:30[Europe/Zurich]"))).toBe(
        true
      );
      expect(contains(march, zoned("2026-04-01T00:00[Europe/Zurich]"))).toBe(
        false
      );
    }
  );

  it(
    "places a date and time in a time period's zone",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      expect(contains(hour, dateTime("2026-03-18T10:30"))).toBe(true);
      expect(contains(march, dateTime("2026-03-18T10:30"))).toBe(true);
    }
  );
});

describe("contains(): periods", () => {
  it("contains its own days and hours, and itself", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(contains(march, dayPeriod("2026-03-31"))).toBe(true);
    expect(contains(march, march)).toBe(true);
    expect(contains(march, hourAt("2026-03-31T23:00"))).toBe(true);
  });

  it("does not contain a period that sticks out", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const lastWeek = periodWith(units, date("2026-03-30"), "week");
    expect(contains(march, lastWeek)).toBe(false);
    expect(contains(march, dayPeriod("2026-04-01"))).toBe(false);
    expect(contains(dayPeriod("2026-03-18"), march)).toBe(false);
  });
});

describe("overlaps()", () => {
  it("does not count periods that only touch", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const april = periodWith(units, date("2026-04-18"), "month");
    expect(overlaps(march, april)).toBe(false);
  });

  it(
    "finds shared time, nested or partial, either way round",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const lastWeek = periodWith(units, date("2026-03-31"), "week");
      expect(overlaps(march, lastWeek)).toBe(true);
      expect(overlaps(lastWeek, march)).toBe(true);
      expect(overlaps(march, hour)).toBe(true);
      expect(overlaps(march, march)).toBe(true);
    }
  );

  it(
    "places a date period in the zone of the moments it is compared with",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      // March in Tokyo starts at Tokyo's midnight, 16:00 on Feb 28 in Zurich
      const aroundMidnight = tokyo("2026-02-28T23:30", "2026-03-01T00:30");
      const beforeMidnight = tokyo("2026-02-28T22:00", "2026-03-01T00:00");
      expect(overlaps(march, aroundMidnight)).toBe(true);
      expect(overlaps(march, beforeMidnight)).toBe(false);
    }
  );
});
