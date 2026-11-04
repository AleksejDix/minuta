import { date, zoned } from "#src/test/temporal";
import { describe, expect, it } from "vitest";
import { createUnits } from "#src/create-units";
import { dayGridWith } from "./day-grid";

const FIRST = 0;
const ONE = 1;
const TWO = 2;
const TWENTY_THREE = 23;
const TWENTY_FOUR = 24;
const TWENTY_FIVE = 25;

describe("dayGridWith(): clock changes", () => {
  it.each([
    {
      day: "2024-03-10",
      gapHour: TWO,
      hours: TWENTY_THREE,
      zone: "America/New_York",
    },
    {
      day: "2024-03-31",
      gapHour: TWO,
      hours: TWENTY_THREE,
      zone: "Europe/Zurich",
    },
    {
      day: "2024-03-31",
      gapHour: ONE,
      hours: TWENTY_THREE,
      zone: "Europe/London",
    },
    {
      day: "2024-10-06",
      gapHour: TWO,
      hours: TWENTY_THREE,
      zone: "Australia/Sydney",
    },
  ] as const)(
    "$zone on $day skips hour $gapHour",
    { timeout: 5000 },
    ({ day, gapHour, hours, zone }) => {
      expect.hasAssertions();
      const grid = dayGridWith(createUnits({ timeZone: zone }), date(day));
      expect(grid.periods).toHaveLength(hours);
      expect(grid.gapHour).toBe(gapHour);
      expect(grid.ambiguousHour).toBeUndefined();
    }
  );
});

describe("dayGridWith(): fall back", () => {
  it.each([
    { ambiguousHour: ONE, day: "2024-11-03", zone: "America/New_York" },
    { ambiguousHour: TWO, day: "2024-10-27", zone: "Europe/Zurich" },
    { ambiguousHour: ONE, day: "2024-10-27", zone: "Europe/London" },
  ] as const)(
    "$zone on $day repeats hour $ambiguousHour",
    { timeout: 5000 },
    ({ ambiguousHour, day, zone }) => {
      expect.hasAssertions();
      const grid = dayGridWith(createUnits({ timeZone: zone }), date(day));
      expect(grid.periods).toHaveLength(TWENTY_FIVE);
      expect(grid.ambiguousHour).toBe(ambiguousHour);
      expect(grid.gapHour).toBeUndefined();
    }
  );
});

describe("dayGridWith(): plain days and zones", () => {
  it("has 24 plain hours without clock changes", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const grid = dayGridWith(
      createUnits({ timeZone: "UTC" }),
      date("2024-03-10")
    );
    expect(grid.periods.map((slot) => slot.hour)).toStrictEqual(
      Array.from({ length: TWENTY_FOUR }, (_unused, hour) => hour)
    );
    expect([grid.gapHour, grid.ambiguousHour]).toStrictEqual([
      undefined,
      undefined,
    ]);
  });

  it(
    "lays out the day of a moment in the moment's own zone",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const grid = dayGridWith(
        createUnits({ timeZone: "UTC" }),
        zoned("2024-03-10T12:00[America/New_York]")
      );
      expect(grid.periods).toHaveLength(TWENTY_THREE);
      expect(grid.periods.map((slot) => slot.start.toString()).at(FIRST)).toBe(
        "2024-03-10T00:00:00-05:00[America/New_York]"
      );
    }
  );

  it("has no hours on the day Samoa skipped", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const grid = dayGridWith(
      createUnits({ timeZone: "Pacific/Apia" }),
      date("2011-12-30")
    );
    expect(grid.periods).toStrictEqual([]);
  });
});
