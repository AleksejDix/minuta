import type { Period, UnitSpec, Units } from "#src/types";
import { describe, expect, it } from "vitest";
import { divideWith } from "#src/operations/divide";
import { nativeUnits } from "#src/adapters/native/index";
import { nextWith } from "#src/operations/shift";
import { periodWith } from "#src/operations/period";

/*
 * With the computer in America/Recife and V8's offset cache in a bad state,
 * @date-fns/tz contradicts itself on Oct 8 2000, the day DST started
 * (https://github.com/AleksejDix/minuta/issues/167):
 * - `endOf` ends the day an hour early, at 00:59:59.999Z, while the moment
 *   after still starts on Oct 8;
 * - adding one day to the day's start returns the same moment.
 * This engine does the same on purpose. Its days start at these moments.
 */
const DAY_STARTS: readonly number[] = [
  "2000-10-07T03:00:00Z",
  "2000-10-08T03:00:00Z",
  "2000-10-09T02:00:00Z",
  "2000-10-10T02:00:00Z",
].map((text) => new Date(text).getTime());
const STUCK = new Date("2000-10-08T03:00:00Z");
const EARLY_END = new Date("2000-10-09T00:59:59.999Z");
const SPAN: Period = {
  end: new Date("2000-10-10T01:59:59.999Z"),
  start: new Date("2000-10-07T03:00:00Z"),
  unit: "custom",
};
const ONE = 1;
const NONE = 0;
const BEFORE_FIRST = -1;

// The index of the day holding `date`
function dayIndex(date: Readonly<Date>): number {
  return DAY_STARTS.filter((start) => start <= date.getTime()).length - ONE;
}

function dayStart(index: number): number {
  return DAY_STARTS.at(index) ?? BEFORE_FIRST;
}

const contradictoryDay: UnitSpec = {
  add: (date: Readonly<Date>, amount: number): Date => {
    if (date.getTime() === STUCK.getTime()) {
      return new Date(date);
    }
    const index = dayIndex(date);
    return new Date(
      dayStart(index + amount) + date.getTime() - dayStart(index)
    );
  },
  diff: (): number => NONE,
  endOf: (date: Readonly<Date>): Date => {
    if (dayStart(dayIndex(date)) === STUCK.getTime()) {
      return new Date(EARLY_END);
    }
    return new Date(dayStart(dayIndex(date) + ONE) - ONE);
  },
  startOf: (date: Readonly<Date>): Date => new Date(dayStart(dayIndex(date))),
};

const units: Units = Object.assign(nativeUnits(), { day: contradictoryDay });

describe("an engine whose add does not move", () => {
  it("never ends a day before it starts", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const day = periodWith(units, STUCK, "day");
    expect(day.end.getTime()).toBeGreaterThanOrEqual(day.start.getTime());
  });

  it("steps past the day with next", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const day = periodWith(units, STUCK, "day");
    const after = nextWith(units, day);
    expect(after.start.getTime()).toBe(day.end.getTime() + ONE);
    expect(after.end.getTime()).toBeGreaterThanOrEqual(after.start.getTime());
  });

  it("divides a span into touching days", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const days = divideWith(units, SPAN, "day");
    const starts = days.map((day) => day.start.getTime());
    const ends = days.map((day) => day.end.getTime());
    expect(starts.at(NONE)).toBe(SPAN.start.getTime());
    expect(ends.at(BEFORE_FIRST)).toBe(SPAN.end.getTime());
    expect(starts.slice(ONE)).toStrictEqual(
      ends.slice(NONE, BEFORE_FIRST).map((end) => end + ONE)
    );
    expect(days.every((day) => day.end.getTime() >= day.start.getTime())).toBe(
      true
    );
  });
});
