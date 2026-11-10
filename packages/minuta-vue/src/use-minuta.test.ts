import { createUnits, withUnits } from "@aleksejdix/minuta";
import { date, now, zoned } from "#src/test/temporal";
import { describe, expect, it } from "vitest";
import type { TimePeriod } from "@aleksejdix/minuta";
import { isRef } from "vue";
import { useMinuta } from "./use-minuta";

const WEEK_LENGTH = 7;

const MONDAY = 1;
const DAYS_PER_WEEK = 7;
const SUNDAY = 0;
const TUESDAY = 2;
const WEDNESDAY = 3;
const THURSDAY = 4;
const FRIDAY = 5;
const SATURDAY = 6;
const WEEK_DAY_INDEXES = [
  SUNDAY,
  MONDAY,
  TUESDAY,
  WEDNESDAY,
  THURSDAY,
  FRIDAY,
  SATURDAY,
] as const;
// Now is a second period, so its start can lie up to a second before creation
const SECOND_MS = 1000;

const testDate = zoned("2024-01-15T12:30:45[Europe/Zurich]");

describe("useMinuta() defaults", () => {
  it("returns reactive browsing and now", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const minuta = useMinuta({ date: testDate });

    expect(isRef(minuta.browsing)).toBe(true);
    expect(isRef(minuta.now)).toBe(true);
    expect(isRef(minuta.units)).toBe(true);
  });

  it(
    "defaults to native units with weeks starting on Monday",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const minuta = useMinuta({ date: testDate });

      expect(minuta.week(testDate).start.dayOfWeek % WEEK_LENGTH).toBe(MONDAY);
      expect(Object.keys(minuta.units.value)).toStrictEqual(
        Object.keys(createUnits())
      );
    }
  );

  it("browses the month of the date by default", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const minuta = useMinuta({ date: testDate });

    expect(minuta.browsing.value).toStrictEqual(minuta.month(testDate));
  });

  it("defaults the date and now to the current date", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const before = now();
    const minuta = useMinuta();
    const after = now();

    const nowPeriod: TimePeriod = minuta.now.value;
    const nowTime = nowPeriod.start.epochMilliseconds;
    expect(nowTime).toBeGreaterThanOrEqual(
      before.epochMilliseconds - SECOND_MS
    );
    expect(nowTime).toBeLessThanOrEqual(after.epochMilliseconds);
    expect(minuta.browsing.value).toStrictEqual(minuta.month(after));
  });
});

describe("useMinuta() options", () => {
  it("accepts units with any week start", { timeout: 5000 }, () => {
    expect.hasAssertions();
    for (const weekStartsOn of WEEK_DAY_INDEXES) {
      const minuta = useMinuta({
        date: testDate,
        units: createUnits({ weekStartsOn }),
      });
      expect(minuta.week(testDate).start.dayOfWeek % WEEK_LENGTH).toBe(
        weekStartsOn
      );
    }
  });

  it("keeps the given units", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { day, month, second } = createUnits();
    const units = { day, month, second };
    const minuta = useMinuta({ date: testDate, units });

    expect(minuta.units.value).toBe(units);
    expect(() => minuta.week(testDate)).toThrow("UNIT_NOT_SUPPORTED");
  });

  it("browses the period of the given unit", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const minuta = useMinuta({ date: testDate, unit: "day" });

    expect(minuta.browsing.value).toStrictEqual({
      end: date("2024-01-16"),
      start: date("2024-01-15"),
      unit: "day",
    });
  });

  it("uses the given now as a second period", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const nowDate = zoned("2024-01-20T15:30:45[Europe/Zurich]");
    const minuta = useMinuta({ date: testDate, now: nowDate });

    expect(minuta.now.value).toStrictEqual({
      end: zoned("2024-01-20T15:30:46[Europe/Zurich]"),
      start: nowDate,
      unit: "second",
    });
  });
});

describe("useMinuta() operations", () => {
  it("are the operations of withUnits(units)", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const units = createUnits({ weekStartsOn: SUNDAY });
    const minuta = useMinuta({ date: testDate, units });
    const bound = withUnits(units);
    const week = bound.week(testDate);

    expect(Object.keys(minuta)).toStrictEqual(
      expect.arrayContaining(Object.keys(bound)) as unknown
    );
    expect(minuta.week(testDate)).toStrictEqual(week);
    expect(minuta.divide(week, "day")).toHaveLength(DAYS_PER_WEEK);
    expect(minuta.next(week)).toStrictEqual(bound.next(week));
  });
});

describe("useMinuta() edge cases", () => {
  it("browses dates at year boundaries", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const endOfYear = zoned("2023-12-31T23:59:59[Europe/Zurich]");
    const minuta = useMinuta({ date: endOfYear });

    expect(minuta.browsing.value.start).toStrictEqual(date("2023-12-01"));
    expect(minuta.contains(minuta.browsing.value, endOfYear)).toBe(true);
  });

  it("browses leap days", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const leapDay = date("2024-02-29");
    const minuta = useMinuta({ date: leapDay, unit: "day" });

    expect(minuta.browsing.value.start).toStrictEqual(leapDay);
  });
});
