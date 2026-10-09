import type { UnitSpec, Units } from "#src/core";
import { describe, expect, it } from "vitest";
import {
  divideWith,
  durationWith,
  nextWith,
  periodWith,
  withUnits,
} from "#src/core";
import { mergeWith, snapWith } from "#src/intervals";
import { nativeUnits } from "#src/native";

/*
 * A unit of your own: register its name, pass its spec next to an adapter's
 * units. Registering it here also type-checks the whole package with a
 * custom unit, so the adapters keep compiling when users add units.
 */
declare module "#src/types" {
  // oxlint-disable-next-line typescript/consistent-type-definitions -- Module augmentation requires an interface
  interface UnitRegistry {
    fortnight: true;
  }
}

const native = nativeUnits();
const DAYS = 14;
const WEEKS = 2;
const ONE_MS = 1;
const ONE = 1;
// Fortnights counted from Monday 5 January 2026
const ANCHOR = new Date("2026-01-05T00:00");

function startOf(date: Readonly<Date>): Date {
  const weeks = native.week.diff(ANCHOR, native.week.startOf(date));
  return native.week.add(ANCHOR, Math.floor(weeks / WEEKS) * WEEKS);
}

const fortnight: UnitSpec = {
  add: (date, amount) => native.week.add(date, amount * WEEKS),
  diff: (from, to) => Math.trunc(native.week.diff(from, to) / WEEKS),
  endOf: (date) =>
    new Date(native.day.add(startOf(date), DAYS).getTime() - ONE_MS),
  startOf,
};

const own: Units = { fortnight };
const units = Object.assign(own, native);
const sprint = periodWith(units, new Date("2026-03-18T12:00"), "fortnight");

describe("a custom unit", () => {
  it("makes periods aligned to its own boundaries", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect([sprint.start, sprint.end, sprint.unit]).toStrictEqual([
      new Date("2026-03-16T00:00"),
      new Date("2026-03-29T23:59:59.999"),
      "fortnight",
    ]);
  });

  it(
    "navigates, divides and measures like a built-in unit",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      expect([
        nextWith(units, sprint).start,
        divideWith(units, sprint, "day").length,
        durationWith(units, sprint, "day"),
        durationWith(units, sprint, "fortnight"),
      ]).toStrictEqual([new Date("2026-03-30T00:00"), DAYS, DAYS, ONE]);
    }
  );

  it("snaps and merges to its boundaries", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const days = divideWith(units, sprint, "day");
    expect(
      snapWith(units, new Date("2026-03-25T12:00"), "fortnight", {
        mode: "floor",
      })
    ).toStrictEqual(new Date("2026-03-16T00:00"));
    expect(mergeWith(units, days, "fortnight")).toHaveProperty(
      "unit",
      "fortnight"
    );
  });

  it("works through withUnits", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const time = withUnits(units);
    expect(
      time.period(new Date("2026-03-18T12:00"), "fortnight")
    ).toStrictEqual(sprint);
  });
});
