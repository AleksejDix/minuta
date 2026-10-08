import { describe, expect, it } from "vitest";
import { isRef } from "vue";
import { nativeUnits } from "minuta/native";
import { useMinuta } from "./use-minuta";
import { withUnits } from "minuta/core";

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

const testDate = new Date("2024-01-15T12:30:45");

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

      expect(minuta.period(testDate, "week").start.getDay()).toBe(MONDAY);
      expect(Object.keys(minuta.units.value)).toStrictEqual(
        Object.keys(nativeUnits())
      );
    }
  );

  it("browses the month of the date by default", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const minuta = useMinuta({ date: testDate });

    expect(minuta.browsing.value).toStrictEqual(
      minuta.period(testDate, "month")
    );
  });

  it("defaults the date and now to the current date", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const before = new Date();
    const minuta = useMinuta();
    const after = new Date();

    const nowTime = minuta.now.value.start.getTime();
    expect(nowTime).toBeGreaterThanOrEqual(before.getTime() - SECOND_MS);
    expect(nowTime).toBeLessThanOrEqual(after.getTime());
    expect(minuta.browsing.value).toStrictEqual(minuta.period(after, "month"));
  });
});

describe("useMinuta() options", () => {
  it("accepts units with any week start", { timeout: 5000 }, () => {
    expect.hasAssertions();
    for (const weekStartsOn of WEEK_DAY_INDEXES) {
      const minuta = useMinuta({
        date: testDate,
        units: nativeUnits({ weekStartsOn }),
      });
      expect(minuta.period(testDate, "week").start.getDay()).toBe(weekStartsOn);
    }
  });

  it("keeps the given units", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { day, month, second } = nativeUnits();
    const units = { day, month, second };
    const minuta = useMinuta({ date: testDate, units });

    expect(minuta.units.value).toBe(units);
    expect(() => minuta.period(testDate, "week")).toThrow("UNIT_NOT_SUPPORTED");
  });

  it("browses the period of the given unit", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const minuta = useMinuta({ date: testDate, unit: "day" });

    expect(minuta.browsing.value).toStrictEqual({
      end: new Date("2024-01-15T23:59:59.999"),
      start: new Date("2024-01-15T00:00:00"),
      unit: "day",
    });
  });

  it("uses the given now as a second period", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const nowDate = new Date("2024-01-20T15:30:45");
    const minuta = useMinuta({ date: testDate, now: nowDate });

    expect(minuta.now.value).toStrictEqual({
      end: new Date("2024-01-20T15:30:45.999"),
      start: nowDate,
      unit: "second",
    });
  });
});

describe("useMinuta() operations", () => {
  it("are the operations of withUnits(units)", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const units = nativeUnits({ weekStartsOn: SUNDAY });
    const minuta = useMinuta({ date: testDate, units });
    const bound = withUnits(units);
    const week = bound.period(testDate, "week");

    expect(Object.keys(minuta)).toStrictEqual(
      expect.arrayContaining(Object.keys(bound)) as unknown
    );
    expect(minuta.period(testDate, "week")).toStrictEqual(week);
    expect(minuta.divide(week, "day")).toHaveLength(DAYS_PER_WEEK);
    expect(minuta.next(week)).toStrictEqual(bound.next(week));
  });
});

describe("useMinuta() edge cases", () => {
  it("browses dates at year boundaries", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const endOfYear = new Date("2023-12-31T23:59:59");
    const minuta = useMinuta({ date: endOfYear });

    expect(minuta.browsing.value.start).toStrictEqual(
      new Date("2023-12-01T00:00:00")
    );
    expect(minuta.contains(minuta.browsing.value, endOfYear)).toBe(true);
  });

  it("browses leap days", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const leapDay = new Date("2024-02-29T00:00:00");
    const minuta = useMinuta({ date: leapDay, unit: "day" });

    expect(minuta.browsing.value.start).toStrictEqual(leapDay);
  });

  it("creates 100 instances in less than 100ms", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const iterations = 100;
    const maxDurationMs = 100;
    const start = performance.now();

    Array.from({ length: iterations }, () => useMinuta({ date: new Date() }));

    expect(performance.now() - start).toBeLessThan(maxDurationMs);
  });
});
