import type { DateSpec, Units } from "#src/index";
import { createUnits, withUnits } from "#src/index";
import { date, text } from "#src/test/temporal";
import { describe, expect, it } from "vitest";

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

const builtIn = createUnits();
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
const time = withUnits(units);
const sprint = time.period(date("2026-03-18"), "fortnight");

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
      expect(time.next(sprint).start.toString()).toBe("2026-03-30");
      expect(time.divide(sprint, "day")).toHaveLength(DAYS);
      expect(time.count(sprint, "day")).toBe(DAYS);
      expect(time.count(sprint, "fortnight")).toBe(ONE);
    }
  );

  it("rounds and merges to its boundaries", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const days = time.divide(sprint, "day");
    const rounded = time.round(date("2026-03-25"), {
      roundingMode: "floor",
      smallestUnit: "fortnight",
    });
    expect(rounded.toString()).toBe("2026-03-16");
    expect(time.merge(days, "fortnight")).toHaveProperty("unit", "fortnight");
  });

  it("keeps the units it was bound to", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(time.units).toBe(units);
  });
});
