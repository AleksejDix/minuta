import { date, zoned } from "#src/test/temporal";
import { days, periodOf, shown, zurich, zurichUnits } from "#src/test/periods";
import { describe, expect, it } from "vitest";
import type { DatePeriod } from "#src/types";
import { clamp } from "./clamp";
import { gap } from "./gap";
import { mergeWith } from "./merge";

const bounds = days("2026-01-10", "2026-01-20");
const second = periodOf("2026-03-02", "day");

describe("clamp()", () => {
  it.each([
    {
      expected: "2026-01-10/2026-01-20 custom",
      from: "2026-01-05",
      to: "2026-01-25",
    },
    {
      expected: "2026-01-12/2026-01-18 custom",
      from: "2026-01-12",
      to: "2026-01-18",
    },
    {
      expected: "2026-01-10/2026-01-15 custom",
      from: "2026-01-05",
      to: "2026-01-15",
    },
    {
      expected: "2026-01-15/2026-01-20 custom",
      from: "2026-01-15",
      to: "2026-01-25",
    },
    { expected: "none", from: "2026-01-20", to: "2026-01-25" },
    { expected: "none", from: "2026-01-01", to: "2026-01-05" },
  ] as const)(
    "clamps $from – $to to $expected",
    { timeout: 5000 },
    ({ expected, from, to }) => {
      expect.hasAssertions();
      const period = days(from, to);
      expect(shown(clamp(period, bounds))).toBe(expected);
    }
  );
});

describe("gap()", () => {
  it.each([
    {
      expected: "2026-03-03/2026-03-05 custom",
      name: "periods with days between",
      other: "2026-03-05",
    },
    { expected: "none", name: "touching periods", other: "2026-03-03" },
    { expected: "none", name: "the same period", other: "2026-03-02" },
  ] as const)(
    "$name: $expected, either way round",
    { timeout: 5000 },
    ({ expected, other }) => {
      expect.hasAssertions();
      const day = periodOf(other, "day");
      expect(shown(gap(second, day))).toBe(expected);
      expect(shown(gap(day, second))).toBe(expected);
    }
  );

  it(
    "finds none inside a period that contains the other",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const month = periodOf("2026-03-02", "month");
      expect(shown(gap(second, month))).toBe("none");
    }
  );

  it("counts a date as its whole day", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const between = gap(date("2026-03-02"), date("2026-03-05"));
    expect(shown(between)).toBe("2026-03-03/2026-03-05 custom");
    const none = gap(date("2026-03-02"), date("2026-03-02"));
    expect(shown(none)).toBe("none");
  });

  it("counts a moment as an instant", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const noon = zoned("2026-03-18T12:00[Europe/Zurich]");
    const between = gap(zoned("2026-03-18T08:00[Europe/Zurich]"), noon);
    expect(between).toBeDefined();
    expect(between).toMatchObject({ end: noon });
  });
});

describe("mergeWith()", () => {
  it(
    "keeps the unit when the periods fill exactly one",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const halves = [
        days("2026-01-01", "2026-01-16"),
        days("2026-01-16", "2026-02-01"),
      ];
      const months = [
        periodOf("2026-01-01", "month"),
        periodOf("2026-02-01", "month"),
        periodOf("2026-03-01", "month"),
      ];
      expect(shown(mergeWith(zurichUnits, halves, "month"))).toBe(
        "2026-01-01/2026-02-01 month"
      );
      expect(shown(mergeWith(zurichUnits, months, "quarter"))).toBe(
        "2026-01-01/2026-04-01 quarter"
      );
    }
  );

  it("is custom otherwise, and spans gaps", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const months = [
      periodOf("2026-01-01", "month"),
      periodOf("2026-03-01", "month"),
    ];
    const single = [periodOf("2026-03-18", "day")];
    expect(shown(mergeWith(zurichUnits, months))).toBe(
      "2026-01-01/2026-04-01 custom"
    );
    expect(shown(mergeWith(zurichUnits, single, "week"))).toBe(
      "2026-03-18/2026-03-19 custom"
    );
  });
});

describe("mergeWith(): moments and nothing", () => {
  it("merges moments, and nothing into undefined", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const halves = [
      zurich("2026-03-18T00:00", "2026-03-18T12:00"),
      zurich("2026-03-18T12:00", "2026-03-19T00:00"),
    ];
    expect(mergeWith(zurichUnits, halves, "day")).toMatchObject({
      unit: "custom",
    });
    const nothing: readonly DatePeriod[] = [];
    expect(mergeWith(zurichUnits, nothing, "day")).toBeUndefined();
  });
});
