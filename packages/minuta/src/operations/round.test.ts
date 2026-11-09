import { date, zoned } from "#src/test/temporal";
import { describe, expect, it } from "vitest";
import { createUnits } from "#src/create-units";
import { roundWith } from "./round";

const units = createUnits({ timeZone: "Europe/Zurich" });
const ZURICH = "[Europe/Zurich]";
const FIFTEEN = 15;
const TEN = 10;
const TWO = 2;

function at(iso: string): ReturnType<typeof zoned> {
  return zoned(`${iso}${ZURICH}`);
}

describe("roundWith(): moments", () => {
  it.each([
    {
      expected: "2026-03-15T10:30:00+01:00",
      mode: "halfExpand",
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
      const snapped = roundWith(units, at(value), {
        roundingIncrement: FIFTEEN,
        roundingMode: mode,
        smallestUnit: unit,
      });
      expect(snapped.toString()).toBe(`${expected}${ZURICH}`);
    }
  );
});

describe("roundWith(): ties and boundaries", () => {
  it(
    "rounds a tie up, and keeps a value that is already a boundary",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      expect(
        roundWith(units, at("2026-03-15T10:07:30"), {
          roundingIncrement: FIFTEEN,
          smallestUnit: "minute",
        }).toString()
      ).toBe(`2026-03-15T10:15:00+01:00${ZURICH}`);
      const boundary = at("2026-03-15T10:15");
      expect(
        roundWith(units, boundary, {
          roundingIncrement: FIFTEEN,
          smallestUnit: "minute",
        })
      ).toBe(boundary);
    }
  );
});

describe("roundWith(): days and enclosing units", () => {
  it(
    "rounds to midnights on a day the clocks change",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      // The 23-hour day's middle is 12:30
      expect(roundWith(units, at("2026-03-29T12:15"), "day").toString()).toBe(
        `2026-03-29T00:00:00+01:00${ZURICH}`
      );
      expect(roundWith(units, at("2026-03-29T12:45"), "day").toString()).toBe(
        `2026-03-30T00:00:00+02:00${ZURICH}`
      );
    }
  );

  it(
    "snaps to the start of a day, which is 01:00 where midnight is skipped",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      expect(
        roundWith(units, at("2026-03-15T10:37"), {
          roundingMode: "ceil",
          smallestUnit: "day",
        }).toString()
      ).toBe(`2026-03-16T00:00:00+01:00${ZURICH}`);
      const santiago = zoned("2026-09-06T05:00[America/Santiago]");
      expect(
        roundWith(units, santiago, {
          roundingMode: "floor",
          smallestUnit: "day",
        }).toString()
      ).toBe("2026-09-06T01:00:00-03:00[America/Santiago]");
    }
  );
});

describe("roundWith(): increments in the enclosing unit", () => {
  it(
    "caps the last step at the end of the enclosing unit",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      // Steps of 10 days count from the month: Mar 1, 11, 21, 31, and Apr 1 ends it
      expect(
        roundWith(units, date("2026-03-31"), {
          roundingIncrement: TEN,
          roundingMode: "ceil",
          smallestUnit: "day",
        }).toString()
      ).toBe("2026-03-31");
      expect(
        roundWith(units, date("2026-03-30"), {
          roundingIncrement: TEN,
          roundingMode: "ceil",
          smallestUnit: "day",
        }).toString()
      ).toBe("2026-03-31");
    }
  );
});

describe("roundWith(): dates", () => {
  it.each([
    { expected: "2026-03-16", mode: "floor", unit: "week" },
    { expected: "2026-03-23", mode: "ceil", unit: "week" },
    { expected: "2026-03-01", mode: "floor", unit: "month" },
    { expected: "2026-04-01", mode: "halfExpand", unit: "month" },
  ] as const)(
    "$mode of 2026-03-18 to the $unit is $expected",
    { timeout: 5000 },
    ({ expected, mode, unit }) => {
      expect.hasAssertions();
      expect(
        roundWith(units, date("2026-03-18"), {
          roundingMode: mode,
          smallestUnit: unit,
        }).toString()
      ).toBe(expected);
    }
  );

  it(
    "counts weeks of a step from the week of Jan 1, 1970",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      // Fortnights from Monday Dec 29, 1969 put one from Mar 9 to Mar 23, 2026
      const floor = roundWith(units, date("2026-03-18"), {
        roundingIncrement: TWO,
        roundingMode: "floor",
        smallestUnit: "week",
      });
      const ceil = roundWith(units, date("2026-03-18"), {
        roundingIncrement: TWO,
        roundingMode: "ceil",
        smallestUnit: "week",
      });
      expect([floor.toString(), ceil.toString()]).toStrictEqual([
        "2026-03-09",
        "2026-03-23",
      ]);
    }
  );
});

describe("roundWith(): Temporal's rounding modes", () => {
  it.each([
    { expected: "10:00", mode: "floor", value: "10:30" },
    { expected: "10:00", mode: "trunc", value: "10:30" },
    { expected: "11:00", mode: "ceil", value: "10:30" },
    { expected: "11:00", mode: "expand", value: "10:30" },
    { expected: "11:00", mode: "halfExpand", value: "10:30" },
    { expected: "11:00", mode: "halfCeil", value: "10:30" },
    { expected: "10:00", mode: "halfFloor", value: "10:30" },
    { expected: "10:00", mode: "halfTrunc", value: "10:30" },
    { expected: "10:00", mode: "halfEven", value: "10:30" },
    { expected: "12:00", mode: "halfEven", value: "11:30" },
    { expected: "11:00", mode: "halfFloor", value: "10:31" },
    { expected: "10:00", mode: "halfCeil", value: "10:29" },
  ] as const)(
    "$mode of $value to the hour is $expected, like Temporal",
    { timeout: 5000 },
    ({ expected, mode, value }) => {
      expect.hasAssertions();
      const moment = at(`2026-03-15T${value}`);
      const rounded = roundWith(units, moment, {
        roundingMode: mode,
        smallestUnit: "hour",
      });
      expect(rounded.toString()).toBe(
        `2026-03-15T${expected}:00+01:00${ZURICH}`
      );
      expect(rounded.toString()).toBe(
        moment.round({ roundingMode: mode, smallestUnit: "hour" }).toString()
      );
    }
  );
});

describe("roundWith(): the roundTo argument", () => {
  it("takes a unit alone, like Temporal's round()", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const moment = at("2026-03-15T10:37");
    expect(roundWith(units, moment, "hour")).toStrictEqual(
      moment.round("hour")
    );
  });

  it("asks for a positive whole roundingIncrement", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(() =>
      roundWith(units, at("2026-03-15T10:37"), {
        roundingIncrement: 0,
        smallestUnit: "minute",
      })
    ).toThrow("roundingIncrement");
  });
});
