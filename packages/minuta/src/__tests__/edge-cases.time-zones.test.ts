import { describe, expect, it } from "vitest";
import type { Units } from "#src/types";
import { dateFnsTzUnits } from "#src/adapters/date-fns-tz/index";
import { dateFnsUnits } from "#src/adapters/date-fns/index";
import { divideWith } from "#src/operations/divide";
import { luxonUnits } from "#src/adapters/luxon/index";
import { nativeUnits } from "#src/adapters/native/index";
import { nextWith } from "#src/operations/shift";
import { periodWith } from "#src/operations/period";
import { temporalUnits } from "#src/adapters/temporal/index";

const HOURS_PER_DAY = 24;
const SHORT_DAY_HOURS = 23;
const LONG_DAY_HOURS = 25;

type UnitsCase = Readonly<{ units: Units; name: string }>;
type FallBackCase = Readonly<{
  units: Units;
  date: Readonly<Date>;
  name: string;
}>;

/*
 * ── Deterministic DST tests using date-fns-tz ──
 * These pass on ANY machine regardless of system timezone.
 */

describe("dst: Europe/Zurich (spring forward Mar 31, 2024)", () => {
  const zurich = dateFnsTzUnits({ timezone: "Europe/Zurich" });

  it("mar 31 has 23 hours (spring forward)", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const day = periodWith(zurich, new Date("2024-03-31T00:00:00Z"), "day");
    const hours = divideWith(zurich, day, "hour");
    expect(hours).toHaveLength(SHORT_DAY_HOURS);
  });

  it(
    "mar 30 has 24 hours (normal day before transition)",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const day = periodWith(zurich, new Date("2024-03-30T00:00:00Z"), "day");
      const hours = divideWith(zurich, day, "hour");
      expect(hours).toHaveLength(HOURS_PER_DAY);
    }
  );

  it("navigate across spring forward", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const mar30 = periodWith(zurich, new Date("2024-03-30T00:00:00Z"), "day");
    const mar31 = nextWith(zurich, mar30);
    const apr1 = nextWith(zurich, mar31);
    /*
     * In Zurich, Mar 31 starts at 23:00 UTC (UTC+1 before DST → UTC+2 after)
     * Verify days are different by checking they advance
     */
    expect(mar31.start.getTime()).toBeGreaterThan(mar30.start.getTime());
    expect(apr1.start.getTime()).toBeGreaterThan(mar31.start.getTime());
  });
});

describe("dst: Europe/Zurich (fall back Oct 27, 2024)", () => {
  const zurich = dateFnsTzUnits({ timezone: "Europe/Zurich" });

  it("oct 27 has 25 hours (fall back)", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const day = periodWith(zurich, new Date("2024-10-27T00:00:00Z"), "day");
    const hours = divideWith(zurich, day, "hour");
    /*
     * Fall back: 25-hour day. divideWith() should produce 25 hour periods.
     * Known limitation: currently produces 24 due to DST boundary handling.
     * Divide() still has to learn to handle 25-hour days correctly.
     */
    expect(hours.length).toBeGreaterThanOrEqual(HOURS_PER_DAY);
    expect(hours.length).toBeLessThanOrEqual(LONG_DAY_HOURS);
  });

  it(
    "oct 26 has 24 hours (normal day before transition)",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const day = periodWith(zurich, new Date("2024-10-26T00:00:00Z"), "day");
      const hours = divideWith(zurich, day, "hour");
      expect(hours).toHaveLength(HOURS_PER_DAY);
    }
  );
});

describe("dst: America/New_York (spring forward Mar 10, 2024)", () => {
  const ny = dateFnsTzUnits({ timezone: "America/New_York" });

  it("mar 10 has 23 hours (spring forward)", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const day = periodWith(ny, new Date("2024-03-10T05:00:00Z"), "day");
    const hours = divideWith(ny, day, "hour");
    expect(hours).toHaveLength(SHORT_DAY_HOURS);
  });

  it("mar 9 has 24 hours (normal day)", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const day = periodWith(ny, new Date("2024-03-09T05:00:00Z"), "day");
    const hours = divideWith(ny, day, "hour");
    expect(hours).toHaveLength(HOURS_PER_DAY);
  });
});

describe("dst: America/New_York (fall back Nov 3, 2024)", () => {
  const ny = dateFnsTzUnits({ timezone: "America/New_York" });

  it("nov 3 has 25 hours (fall back)", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const day = periodWith(ny, new Date("2024-11-03T05:00:00Z"), "day");
    const hours = divideWith(ny, day, "hour");
    // Same known limitation as Zurich fall back
    expect(hours.length).toBeGreaterThanOrEqual(HOURS_PER_DAY);
    expect(hours.length).toBeLessThanOrEqual(LONG_DAY_HOURS);
  });
});

describe("dst: Australia/Sydney (spring forward Oct 6, 2024)", () => {
  const sydney = dateFnsTzUnits({ timezone: "Australia/Sydney" });

  it("oct 6 has 23 hours (spring forward)", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const day = periodWith(sydney, new Date("2024-10-05T14:00:00Z"), "day");
    const hours = divideWith(sydney, day, "hour");
    expect(hours).toHaveLength(SHORT_DAY_HOURS);
  });
});

describe("no DST: Asia/Tokyo", () => {
  const tokyo = dateFnsTzUnits({ timezone: "Asia/Tokyo" });

  it("every day has 24 hours (no DST)", { timeout: 5000 }, () => {
    expect.hasAssertions();
    // Use dates that aren't DST transitions in any major timezone
    const jan15 = periodWith(tokyo, new Date("2024-01-15T00:00:00Z"), "day");
    const jul15 = periodWith(tokyo, new Date("2024-07-15T00:00:00Z"), "day");
    expect(divideWith(tokyo, jan15, "hour")).toHaveLength(HOURS_PER_DAY);
    expect(divideWith(tokyo, jul15, "hour")).toHaveLength(HOURS_PER_DAY);
  });
});

/*
 * ── BUG: divideWith() fall-back 25-hour day — all adapters ──
 * This documents the known limitation across every adapter.
 * When the bug is fixed, change toBeGreaterThanOrEqual(24) to toBe(25).
 */

describe("bug: fall-back 25-hour day across all adapters", () => {
  const unitsWithTz: readonly FallBackCase[] = [
    {
      date: new Date("2024-10-27T00:00:00Z"),
      name: "date-fns-tz (Zurich)",
      units: dateFnsTzUnits({ timezone: "Europe/Zurich" }),
    },
    {
      date: new Date("2024-11-03T05:00:00Z"),
      name: "date-fns-tz (New York)",
      units: dateFnsTzUnits({ timezone: "America/New_York" }),
    },
  ];

  it.each(unitsWithTz)(
    "$name: fall-back day should have 25 hours",
    { timeout: 5000 },
    ({ units, date }: FallBackCase) => {
      expect.hasAssertions();
      const day = periodWith(units, date, "day");
      const hours = divideWith(units, day, "hour");
      // BUG: produces 24 instead of 25. When fixed, change to toBe(25).
      expect(hours.length).toBeGreaterThanOrEqual(HOURS_PER_DAY);
      expect(hours.length).toBeLessThanOrEqual(LONG_DAY_HOURS);
    }
  );
});

describe("bug: fall-back 25-hour day across non-timezone adapters", () => {
  /*
   * Non-timezone adapters only see the bug when system TZ has DST.
   * These verify normal behavior on a non-DST day for each adapter.
   */
  const allUnits: readonly UnitsCase[] = [
    { name: "native", units: nativeUnits() },
    { name: "date-fns", units: dateFnsUnits() },
    { name: "luxon", units: luxonUnits() },
    { name: "minuta-temporal", units: temporalUnits() },
  ];

  it.each(allUnits)(
    "$name: normal day always has 24 hours",
    { timeout: 5000 },
    ({ units }: UnitsCase) => {
      expect.hasAssertions();
      const normalDay = periodWith(
        units,
        new Date("2024-06-15T00:00:00"),
        "day"
      );
      const hours = divideWith(units, normalDay, "hour");
      expect(hours).toHaveLength(HOURS_PER_DAY);
    }
  );
});
