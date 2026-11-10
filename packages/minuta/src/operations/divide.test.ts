import type { Period, Unit } from "#src/types";
import { period as between, periodWith } from "./period";
import { date, text, zoned } from "#src/test/temporal";
import { describe, expect, it } from "vitest";
import { compare } from "#src/values";
import { createUnits } from "#src/create-units";
import { divideWith } from "./divide";

const units = createUnits({ timeZone: "Europe/Zurich" });

const EQUAL = 0;
const FIRST = 0;
const LAST = -1;
const TWENTY_FIVE = 25;
const ONE = 1;
const TWO = 2;
const THREE = 3;
const FOUR = 4;
const SEVEN = 7;
const TWELVE = 12;
const FIFTEEN = 15;
const TWENTY = 20;
const TWENTY_FOUR = 24;
const TWENTY_SEVEN = 27;
const THIRTY = 30;
const THIRTY_ONE = 31;
const FORTY_EIGHT = 48;
const FIFTY_THREE = 53;
const SIXTY = 60;

// The starts of `pieces`, as text
function starts(pieces: readonly Period[]): string[] {
  return pieces.map((piece) => piece.start.toString());
}

// The ends of `pieces`, as text
function ends(pieces: readonly Period[]): string[] {
  return pieces.map((piece) => piece.end.toString());
}

// Whether every piece starts where the one before it ends
function touching(pieces: readonly Period[]): boolean {
  return pieces.every((piece, index) => {
    const previous = pieces[index - ONE];
    return (
      previous === undefined || compare(previous.end, piece.start) === EQUAL
    );
  });
}

describe("divideWith(): one unit per chunk", () => {
  it.each([
    { count: TWELVE, of: "year", unit: "month", value: "2026-03-18" },
    { count: THIRTY_ONE, of: "month", unit: "day", value: "2026-03-18" },
    { count: SEVEN, of: "week", unit: "day", value: "2026-03-18" },
    { count: TWENTY_FOUR, of: "day", unit: "hour", value: "2026-03-18" },
  ] as const)(
    "a $of has $count $unit chunks that touch",
    { timeout: 5000 },
    ({ count, of, unit, value }) => {
      expect.hasAssertions();
      const chunks = divideWith(
        units,
        periodWith(units, date(value), of),
        unit
      );
      expect(chunks).toHaveLength(count);
      expect(touching(chunks)).toBe(true);
      expect(chunks.every((chunk) => chunk.unit === unit)).toBe(true);
    }
  );

  it.each([
    { of: "hour", unit: "minute" },
    { of: "minute", unit: "second" },
  ] as const)(
    "a $of has 60 $unit chunks",
    { timeout: 5000 },
    ({ of, unit }) => {
      expect.hasAssertions();
      const period = periodWith(
        units,
        zoned("2026-03-18T10:37:42[Europe/Zurich]"),
        of
      );
      expect(divideWith(units, period, unit)).toHaveLength(SIXTY);
    }
  );
});

describe("divideWith(): kinds of chunks", () => {
  it(
    "gives date chunks for date units and moments for time units",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const day = periodWith(units, date("2026-03-18"), "day");
      const week = periodWith(units, date("2026-03-18"), "week");
      const days = divideWith(units, week, "day");
      const hours = divideWith(units, day, "hour");
      expect(starts(days).at(FIRST)).toBe("2026-03-16");
      expect(starts(hours).at(FIRST)).toBe(
        "2026-03-18T00:00:00+01:00[Europe/Zurich]"
      );
    }
  );

  it("2020 touches 53 Monday weeks", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const year = periodWith(units, date("2020-06-01"), "year");
    expect(divideWith(units, year, "week")).toHaveLength(FIFTY_THREE);
  });
});

describe("divideWith(): clipped chunks", () => {
  it(
    "cuts the first and last week of a month and marks them custom",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const weeks = divideWith(
        units,
        periodWith(units, date("2026-03-01"), "month"),
        "week"
      );
      expect(weeks.map((week) => text(week))).toStrictEqual([
        "2026-03-01/2026-03-02 custom",
        "2026-03-02/2026-03-09 week",
        "2026-03-09/2026-03-16 week",
        "2026-03-16/2026-03-23 week",
        "2026-03-23/2026-03-30 week",
        "2026-03-30/2026-04-01 custom",
      ]);
    }
  );

  it("marks a unit larger than the period custom", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const day = periodWith(units, date("2026-03-18"), "day");
    expect(
      divideWith(units, day, "month").map((chunk) => text(chunk))
    ).toStrictEqual(["2026-03-18/2026-03-19 custom"]);
  });

  it(
    "splits a span of moments at the starts of the days in its zone",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const span = between(
        zoned("2026-03-18T10:00[Asia/Tokyo]"),
        zoned("2026-03-20T09:00[Asia/Tokyo]")
      );
      expect(
        divideWith(units, span, "day").map((chunk) => chunk.unit)
      ).toStrictEqual(["custom", "day", "custom"]);
    }
  );
});

describe("divideWith(): spans and empty periods", () => {
  it("divides nothing out of an empty period", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const empty = between(date("2026-03-18"), date("2026-03-18"));
    expect(divideWith(units, empty, "day")).toStrictEqual([]);
  });
});

describe("divideWith(): steps", () => {
  it.each([
    { count: FOUR, of: "hour", step: FIFTEEN, unit: "minute" },
    { count: THREE, of: "hour", step: TWENTY, unit: "minute" },
    { count: FORTY_EIGHT, of: "day", step: THIRTY, unit: "minute" },
    { count: TWELVE, of: "day", step: TWO, unit: "hour" },
    { count: FOUR, of: "year", step: THREE, unit: "month" },
  ] as const)(
    "a $of in chunks of $step $unit gives $count touching chunks",
    { timeout: 5000 },
    ({ count, of, step, unit }) => {
      expect.hasAssertions();
      const value = zoned("2026-03-18T10:37[Europe/Zurich]");
      const chunks = divideWith(
        units,
        periodWith(units, value, of),
        unit as Unit,
        { step }
      );
      expect(chunks).toHaveLength(count);
      expect(touching(chunks)).toBe(true);
      expect(chunks.every((chunk) => chunk.unit === "custom")).toBe(true);
    }
  );
});

describe("divideWith(): uneven steps", () => {
  it(
    "cuts 2024, which starts on a Monday, into 26 fortnights and 2 days",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const year = periodWith(units, date("2024-06-01"), "year");
      const fortnights = divideWith(units, year, "week", { step: TWO });
      expect(fortnights).toHaveLength(TWENTY_SEVEN);
      expect(fortnights.map((fortnight) => text(fortnight)).at(LAST)).toBe(
        "2024-12-30/2025-01-01 custom"
      );
    }
  );

  it(
    "cuts the last chunk of an uneven step at the period's end",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const hour = periodWith(
        units,
        zoned("2026-03-18T10:00[Europe/Zurich]"),
        "hour"
      );
      const chunks = divideWith(units, hour, "minute", { step: TWENTY_FIVE });
      expect(ends(chunks).at(LAST)).toBe(hour.end.toString());
    }
  );

  it("is a plain division with step 1", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const month = periodWith(units, date("2026-03-01"), "month");
    expect(divideWith(units, month, "day", { step: ONE })).toStrictEqual(
      divideWith(units, month, "day")
    );
  });
});

describe("divideWith(): days of a time period across a clock change", () => {
  it.each([
    { from: "2026-03-28T00:00", hours: "24 23", to: "2026-03-30T00:00" },
    { from: "2026-10-24T00:00", hours: "24 25", to: "2026-10-26T00:00" },
  ] as const)(
    "cuts $from to $to at midnights, not at the clock change",
    { timeout: 5000 },
    ({ from, hours, to }) => {
      expect.hasAssertions();
      const span = between(
        zoned(`${from}[Europe/Zurich]`),
        zoned(`${to}[Europe/Zurich]`)
      );
      const days = divideWith(units, span, "day");
      expect(
        days
          .map((day) => day.start.until(day.end, { largestUnit: "hour" }).hours)
          .join(" ")
      ).toBe(hours);
      expect(touching(days)).toBe(true);
    }
  );
});
