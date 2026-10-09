import type { Period, Units } from "#src/types";
import { describe, expect, it } from "vitest";
import { periodWith, range } from "./period";
import { gap } from "./gap";
import { getUnitsTestCases } from "#src/test/shared-adapter-tests";

type Point = Period | Readonly<Date>;

type GapCase = Readonly<{
  /** The expected gap, or undefined for none */
  expected: Period | undefined;
  from: (units: Units) => Point;
  name: string;
  to: (units: Units) => Point;
}>;

function day(iso: string): (units: Units) => Period {
  return (units) => periodWith(units, new Date(iso), "day");
}

function between(start: string, end: string): Period {
  return range(new Date(start), new Date(end));
}

function instant(iso: string): () => Readonly<Date> {
  return () => new Date(iso);
}

const CASES: readonly GapCase[] = [
  {
    expected: between("2026-03-03T00:00", "2026-03-04T23:59:59.999"),
    from: day("2026-03-02T12:00"),
    name: "periods with days between",
    to: day("2026-03-05T12:00"),
  },
  {
    expected: undefined,
    from: day("2026-03-02T12:00"),
    name: "adjacent periods",
    to: day("2026-03-03T12:00"),
  },
  {
    expected: undefined,
    from: (units) => periodWith(units, new Date("2026-03-15T12:00"), "month"),
    name: "a period containing the other",
    to: day("2026-03-10T12:00"),
  },
  {
    expected: undefined,
    from: () =>
      range(new Date("2026-03-01T00:00"), new Date("2026-03-10T00:00")),
    name: "overlapping periods",
    to: () => range(new Date("2026-03-05T00:00"), new Date("2026-03-20T00:00")),
  },
  {
    expected: between("2026-03-01T10:00:00.001", "2026-03-01T11:59:59.999"),
    from: instant("2026-03-01T10:00"),
    name: "two dates",
    to: instant("2026-03-01T12:00"),
  },
  {
    expected: undefined,
    from: instant("2026-03-01T10:00"),
    name: "the same date twice",
    to: instant("2026-03-01T10:00"),
  },
  {
    expected: between("2026-03-03T00:00", "2026-03-04T23:59:59.999"),
    from: day("2026-03-02T12:00"),
    name: "a period and a later date",
    to: instant("2026-03-05T00:00"),
  },
  {
    expected: between("2026-03-03T00:00", "2026-03-04T23:59:59.999"),
    from: instant("2026-03-05T00:00"),
    name: "a date and an earlier period",
    to: day("2026-03-02T12:00"),
  },
  {
    expected: undefined,
    from: instant("2026-03-02T23:59:59.999"),
    name: "a date inside the period",
    to: day("2026-03-02T12:00"),
  },
];

const unitsCases = getUnitsTestCases();

describe.each(unitsCases)("gap() with %s adapter", (_name, units) => {
  it.each(CASES)("$name", { timeout: 5000 }, ({ expected, from, to }) => {
    expect.hasAssertions();
    const gaps = [gap(from(units), to(units)), gap(to(units), from(units))];
    expect(gaps).toStrictEqual([expected, expected]);
  });
});
