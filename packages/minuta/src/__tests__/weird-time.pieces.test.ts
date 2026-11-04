import { describe, expect, it } from "vitest";
import { nextWith, previousWith } from "#src/operations/shift";
import { createUnits } from "#src/create-units";
import { date } from "#src/test/temporal";
import { divideWith } from "#src/operations/divide";
import { durationWith } from "#src/operations/duration";
import { periodWith } from "#src/operations/period";

/*
 * The pieces of time that only exist on weird days: a date the clocks skip,
 * and the half hours a 30-minute clock change leaves.
 */

const NONE = 0;
const ONE = 1;
const SHOWN_HOURS = 4;

describe("weird time: Pacific/Apia, the skipped day", () => {
  const units = createUnits({ timeZone: "Pacific/Apia" });
  const skipped = periodWith(units, date("2011-12-30"), "day");

  it("is a date with no hours", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(skipped.start.toString()).toBe("2011-12-30");
    expect(divideWith(units, skipped, "hour")).toStrictEqual([]);
    expect(durationWith(units, skipped, "hour")).toBe(NONE);
  });

  it(
    "sits between its neighbours like any other date",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      expect(previousWith(units, skipped).start.toString()).toBe("2011-12-29");
      expect(nextWith(units, skipped).start.toString()).toBe("2011-12-31");
    }
  );
});

describe("weird time: Australia/Lord_Howe, hours around a 30-minute change", () => {
  const units = createUnits({ timeZone: "Australia/Lord_Howe" });

  function hoursAround(day: string): string[] {
    const hours = divideWith(
      units,
      periodWith(units, date(day), "day"),
      "hour"
    );
    return hours
      .slice(ONE, SHOWN_HOURS)
      .map(
        (hour) => `${hour.start.toPlainTime().toString()}${hour.start.offset}`
      );
  }

  it(
    "splits wall hour 2 where the clocks jump from 1:59 to 2:30",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      expect(hoursAround("2026-10-04")).toStrictEqual([
        "01:00:00+10:30",
        "02:30:00+11:00",
        "03:00:00+11:00",
      ]);
    }
  );

  it(
    "makes the repeated half hour its own piece where they go back to 1:30",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      expect(hoursAround("2026-04-05")).toStrictEqual([
        "01:00:00+11:00",
        "01:30:00+10:30",
        "02:00:00+10:30",
      ]);
    }
  );
});
