import { date, zoned } from "#src/test/temporal";
import { describe, expect, it } from "vitest";
import { createUnits } from "#src/create-units";
import { snapWith } from "./snap-with";

const units = createUnits({ timeZone: "Europe/Zurich" });
const ZURICH = "[Europe/Zurich]";
const FIFTEEN = 15;
const TEN = 10;
const TWO = 2;

function at(iso: string): ReturnType<typeof zoned> {
  return zoned(`${iso}${ZURICH}`);
}

describe("snapWith(): moments", () => {
  it.each([
    {
      expected: "2026-03-15T10:30:00+01:00",
      mode: "nearest",
      unit: "minute",
      value: "2026-03-15T10:37",
    },
    {
      expected: "2026-03-15T10:30:00+01:00",
      mode: "floor",
      unit: "minute",
      value: "2026-03-15T10:37",
    },
    {
      expected: "2026-03-15T10:45:00+01:00",
      mode: "ceil",
      unit: "minute",
      value: "2026-03-15T10:37",
    },
  ] as const)(
    "$mode of $value to 15 minutes is $expected",
    { timeout: 5000 },
    ({ expected, mode, unit, value }) => {
      expect.hasAssertions();
      const snapped = snapWith(units, at(value), unit, { mode, step: FIFTEEN });
      expect(snapped.toString()).toBe(`${expected}${ZURICH}`);
    }
  );

  it(
    "rounds a tie up, and keeps a value that is already a boundary",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      expect(
        snapWith(units, at("2026-03-15T10:07:30"), "minute", {
          step: FIFTEEN,
        }).toString()
      ).toBe(`2026-03-15T10:15:00+01:00${ZURICH}`);
      const boundary = at("2026-03-15T10:15");
      expect(snapWith(units, boundary, "minute", { step: FIFTEEN })).toBe(
        boundary
      );
    }
  );
});

describe("snapWith(): days and enclosing units", () => {
  it(
    "snaps to the start of a day, which is 01:00 where midnight is skipped",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      expect(
        snapWith(units, at("2026-03-15T10:37"), "day", {
          mode: "ceil",
        }).toString()
      ).toBe(`2026-03-16T00:00:00+01:00${ZURICH}`);
      const santiago = zoned("2026-09-06T05:00[America/Santiago]");
      expect(
        snapWith(units, santiago, "day", { mode: "floor" }).toString()
      ).toBe("2026-09-06T01:00:00-03:00[America/Santiago]");
    }
  );

  it(
    "caps the last step at the end of the enclosing unit",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      // Steps of 10 days count from the month: Mar 1, 11, 21, 31, and Apr 1 ends it
      expect(
        snapWith(units, date("2026-03-31"), "day", {
          mode: "ceil",
          step: TEN,
        }).toString()
      ).toBe("2026-03-31");
      expect(
        snapWith(units, date("2026-03-30"), "day", {
          mode: "ceil",
          step: TEN,
        }).toString()
      ).toBe("2026-03-31");
    }
  );
});

describe("snapWith(): dates", () => {
  it.each([
    { expected: "2026-03-16", mode: "floor", unit: "week" },
    { expected: "2026-03-23", mode: "ceil", unit: "week" },
    { expected: "2026-03-01", mode: "floor", unit: "month" },
    { expected: "2026-04-01", mode: "nearest", unit: "month" },
  ] as const)(
    "$mode of 2026-03-18 to the $unit is $expected",
    { timeout: 5000 },
    ({ expected, mode, unit }) => {
      expect.hasAssertions();
      expect(
        snapWith(units, date("2026-03-18"), unit, { mode }).toString()
      ).toBe(expected);
    }
  );

  it(
    "counts weeks of a step from the week of Jan 1, 1970",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      // Fortnights from Monday Dec 29, 1969 put one from Mar 9 to Mar 23, 2026
      const floor = snapWith(units, date("2026-03-18"), "week", {
        mode: "floor",
        step: TWO,
      });
      const ceil = snapWith(units, date("2026-03-18"), "week", {
        mode: "ceil",
        step: TWO,
      });
      expect([floor.toString(), ceil.toString()]).toStrictEqual([
        "2026-03-09",
        "2026-03-23",
      ]);
    }
  );
});
