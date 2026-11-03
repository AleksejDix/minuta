import type { DateSpec, Units } from "#src/core";
import { date, text } from "#src/test/temporal";
import { describe, expect, it } from "vitest";
import {
  divideWith,
  durationWith,
  nextWith,
  periodWith,
  withUnits,
} from "#src/core";
import { mergeWith, snapWith } from "#src/intervals";
import { temporalUnits } from "#src/temporal";

/*
 * A unit of your own: register its name and kind, pass its spec next to
 * the built-in units. Registering it here also type-checks the whole
 * package with a custom unit, so the built-in units keep compiling when
 * users add units.
 */
declare module "#src/types" {
  // oxlint-disable-next-line typescript/consistent-type-definitions -- Module augmentation requires an interface
  interface UnitRegistry {
    fortnight: "date";
  }
}

const builtIn = temporalUnits();
const WEEKS = 2;
const DAYS = 14;
const ONE = 1;
// Fortnights counted from Monday 5 January 2026
const ANCHOR = date("2026-01-05");

const fortnight: DateSpec = {
  add: (value, amount) => builtIn.week.add(value, amount * WEEKS),
  diff: (from, to) => Math.trunc(builtIn.week.diff(from, to) / WEEKS),
  kind: "date",
  startOf: (value) => {
    const weeks = builtIn.week.diff(ANCHOR, builtIn.week.startOf(value));
    return builtIn.week.add(ANCHOR, Math.floor(weeks / WEEKS) * WEEKS);
  },
};

const own: Units = { fortnight };
const units = Object.assign(own, builtIn);
const sprint = periodWith(units, date("2026-03-18"), "fortnight");

describe("a custom unit", () => {
  it("makes periods aligned to its own boundaries", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(text(sprint)).toBe("2026-03-16/2026-03-30 fortnight");
  });

  it(
    "navigates, divides and measures like a built-in unit",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      expect(nextWith(units, sprint).start.toString()).toBe("2026-03-30");
      expect(divideWith(units, sprint, "day")).toHaveLength(DAYS);
      expect(durationWith(units, sprint, "day")).toBe(DAYS);
      expect(durationWith(units, sprint, "fortnight")).toBe(ONE);
    }
  );

  it("snaps and merges to its boundaries", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const days = divideWith(units, sprint, "day");
    const snapped = snapWith(units, date("2026-03-25"), "fortnight", {
      mode: "floor",
    });
    expect(snapped.toString()).toBe("2026-03-16");
    expect(mergeWith(units, days, "fortnight")).toHaveProperty(
      "unit",
      "fortnight"
    );
  });

  it("works through withUnits", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const time = withUnits(units);
    expect(time.period(date("2026-03-18"), "fortnight")).toStrictEqual(sprint);
  });
});
