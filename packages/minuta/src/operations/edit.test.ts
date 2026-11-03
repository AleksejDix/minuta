import { date, text, zoned } from "#src/test/temporal";
import { days, periodOf, shown, shownAll, zurich } from "#src/test/periods";
import { describe, expect, it } from "vitest";
import { move } from "./move";
import { resize } from "./resize";
import { split } from "./split";

const span = days("2026-03-10", "2026-03-20");

describe("move()", () => {
  it(
    "moves a date period to a new start, keeping its days",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const moved = move(days("2026-03-10", "2026-03-13"), date("2026-04-01"));
      expect(text(moved)).toBe("2026-04-01/2026-04-04 custom");
    }
  );

  it("moves a time period, keeping its exact length", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const meeting = zurich("2026-03-29T09:00", "2026-03-29T10:00");
    const moved = move(meeting, zoned("2026-04-02T14:00[Europe/Zurich]"));
    expect(moved.end.toString()).toBe(
      "2026-04-02T15:00:00+02:00[Europe/Zurich]"
    );
  });
});

describe("resize()", () => {
  it.each([
    {
      edge: "end",
      expected: "2026-03-10/2026-03-25 custom",
      value: "2026-03-25",
    },
    {
      edge: "start",
      expected: "2026-03-15/2026-03-20 custom",
      value: "2026-03-15",
    },
    {
      edge: "start",
      expected: "2026-03-20/2026-03-20 custom",
      value: "2026-03-20",
    },
    { edge: "end", expected: "none", value: "2026-03-01" },
  ] as const)(
    "moves the $edge to $value: $expected",
    { timeout: 5000 },
    ({ edge, expected, value }) => {
      expect.hasAssertions();
      const resized = resize(span, edge, date(value));
      expect(shown(resized)).toBe(expected);
    }
  );
});

describe("split()", () => {
  const march = periodOf("2026-03-18", "month");

  it("splits where the second part starts", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const parts = split(march, date("2026-03-15"));
    expect(shownAll(parts)).toStrictEqual([
      "2026-03-01/2026-03-15 custom",
      "2026-03-15/2026-04-01 custom",
    ]);
  });

  it.each(["2026-03-01", "2026-04-01", "2026-05-01"])(
    "does not split at %s, which is not strictly inside",
    { timeout: 5000 },
    (value) => {
      expect.hasAssertions();
      const parts = split(march, date(value));
      expect(parts).toBeUndefined();
    }
  );
});
