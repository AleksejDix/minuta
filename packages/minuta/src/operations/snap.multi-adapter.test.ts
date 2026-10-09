import { describe, expect, it } from "vitest";
import type { SnapMode } from "./snap";
import type { Unit } from "#src/types";
import { getUnitsTestCases } from "#src/test/shared-adapter-tests";
import { snapWith } from "./snap";

const QUARTER_HOUR = 15;
const TWO = 2;
const SEVEN = 7;
const TEN = 10;
const MIDNIGHT = 0;

type SnapCase = Readonly<{
  date: string;
  expected: string;
  mode: SnapMode;
  step?: number;
  unit: Unit;
}>;

// Local wall-clock times; weeks start on Monday
const CASES: readonly SnapCase[] = [
  {
    date: "2026-03-18T10:37",
    expected: "2026-03-18T10:30",
    mode: "nearest",
    step: QUARTER_HOUR,
    unit: "minute",
  },
  {
    date: "2026-03-18T10:38",
    expected: "2026-03-18T10:45",
    mode: "nearest",
    step: QUARTER_HOUR,
    unit: "minute",
  },
  {
    date: "2026-03-18T10:37",
    expected: "2026-03-18T10:30",
    mode: "floor",
    step: QUARTER_HOUR,
    unit: "minute",
  },
  {
    date: "2026-03-18T10:31",
    expected: "2026-03-18T10:45",
    mode: "ceil",
    step: QUARTER_HOUR,
    unit: "minute",
  },
  {
    date: "2026-03-18T10:52:30",
    expected: "2026-03-18T11:00",
    mode: "nearest",
    step: QUARTER_HOUR,
    unit: "minute",
  },
  {
    date: "2026-03-18T10:30",
    expected: "2026-03-18T10:30",
    mode: "ceil",
    step: QUARTER_HOUR,
    unit: "minute",
  },
  {
    date: "2026-03-18T10:00:29",
    expected: "2026-03-18T10:00",
    mode: "nearest",
    unit: "minute",
  },
  {
    date: "2026-03-18T10:00:30",
    expected: "2026-03-18T10:01",
    mode: "nearest",
    unit: "minute",
  },
  {
    date: "2026-03-18T10:37",
    expected: "2026-03-18T11:00",
    mode: "ceil",
    unit: "hour",
  },
  {
    date: "2026-03-18T11:20",
    expected: "2026-03-18T10:00",
    mode: "floor",
    step: TWO,
    unit: "hour",
  },
  {
    date: "2026-03-18T10:37",
    expected: "2026-03-18T00:00",
    mode: "floor",
    unit: "day",
  },
  {
    date: "2026-03-18T10:37",
    expected: "2026-03-19T00:00",
    mode: "ceil",
    unit: "day",
  },
  {
    date: "2026-03-18T13:00",
    expected: "2026-03-19T00:00",
    mode: "nearest",
    unit: "day",
  },
  {
    date: "2026-03-10T12:00",
    expected: "2026-03-08T00:00",
    mode: "floor",
    step: SEVEN,
    unit: "day",
  },
  {
    date: "2026-03-30T12:00",
    expected: "2026-04-01T00:00",
    mode: "ceil",
    step: SEVEN,
    unit: "day",
  },
  {
    date: "2026-03-18T10:37",
    expected: "2026-03-16T00:00",
    mode: "floor",
    unit: "week",
  },
  {
    date: "2026-03-18T10:37",
    expected: "2026-03-23T00:00",
    mode: "ceil",
    unit: "week",
  },
  {
    date: "2026-03-20T12:00",
    expected: "2026-03-23T00:00",
    mode: "nearest",
    unit: "week",
  },
  {
    date: "2026-03-18T10:37",
    expected: "2026-04-01T00:00",
    mode: "ceil",
    unit: "month",
  },
  {
    date: "2026-08-18T10:37",
    expected: "2026-07-01T00:00",
    mode: "floor",
    unit: "quarter",
  },
  {
    date: "2026-08-18T10:37",
    expected: "2026-07-01T00:00",
    mode: "floor",
    step: TWO,
    unit: "quarter",
  },
  {
    date: "2026-03-18T10:37",
    expected: "2026-01-01T00:00",
    mode: "nearest",
    unit: "year",
  },
  {
    date: "2026-03-18T10:37",
    expected: "2020-01-01T00:00",
    mode: "floor",
    step: TEN,
    unit: "year",
  },
];

const unitsCases = getUnitsTestCases();

describe.each(unitsCases)("snapWith() with %s adapter", (_name, units) => {
  it.each(CASES)(
    "$mode $date to $step $unit → $expected",
    { timeout: 5000 },
    ({ date, expected, mode, step, unit }) => {
      expect.hasAssertions();
      expect(
        snapWith(units, new Date(date), unit, { mode, step })
      ).toStrictEqual(new Date(expected));
    }
  );

  it("defaults to the nearest single unit", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(snapWith(units, new Date("2026-03-18T10:37"), "hour")).toStrictEqual(
      new Date("2026-03-18T11:00")
    );
  });
});

describe.each(unitsCases)(
  "snapWith() over DST with %s adapter",
  (_name, units) => {
    it("snaps to the real start of DST days", { timeout: 5000 }, () => {
      expect.hasAssertions();
      for (const iso of [
        "2026-03-29T12:00",
        "2026-10-25T12:00",
        "2026-03-08T12:00",
        "2026-11-01T12:00",
      ]) {
        const date = new Date(iso);
        const start = snapWith(units, date, "day", { mode: "floor" });
        const end = snapWith(units, date, "day", { mode: "ceil" });
        expect([
          start.getHours(),
          start.getDate(),
          end.getHours(),
        ]).toStrictEqual([MIDNIGHT, date.getDate(), MIDNIGHT]);
      }
    });
  }
);
