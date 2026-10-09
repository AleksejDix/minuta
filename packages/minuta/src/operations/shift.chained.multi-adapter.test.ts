import type { Period, Unit, Units } from "#src/types";
import { describe, expect, it } from "vitest";
import { nextWith, shiftWith } from "./shift";
import { dateFnsTzUnits } from "#src/adapters/date-fns-tz/index";
import { getUnitsTestCases } from "#src/test/shared-adapter-tests";
import { periodWith } from "./period";

const STEPS = 14;
const ONE = 1;
const UNITS: readonly Unit[] = [
  "year",
  "quarter",
  "month",
  "week",
  "day",
  "hour",
];
// Month ends, a leap day and a day before a DST change
const STARTS: readonly string[] = [
  "2024-01-31T10:00",
  "2024-02-29T10:00",
  "2026-03-28T23:00",
  "2026-10-24T23:30",
];

const unitsCases = [
  ...getUnitsTestCases(),
  ["date-fns-tz Zurich", dateFnsTzUnits({ timeZone: "Europe/Zurich" })],
  ["date-fns-tz New York", dateFnsTzUnits({ timeZone: "America/New_York" })],
] as const;

/**
 * Call next() `STEPS` times in a row.
 *
 * @param units - The units to navigate with
 * @param start - Where to start
 * @returns The period reached
 */
function chainedNext(units: Units, start: Period): Period {
  let current = start;
  for (let step = 0; step < STEPS; step += ONE) {
    current = nextWith(units, current);
  }
  return current;
}

// #43: chained navigation must not drift away from direct shifts
describe.each(unitsCases)("chained next() with %s adapter", (_name, units) => {
  it.each(UNITS)(
    "lands where shift() does for %s",
    { timeout: 5000 },
    (unit) => {
      expect.hasAssertions();
      const drifted = STARTS.filter((iso) => {
        const start = periodWith(units, new Date(iso), unit);
        return (
          chainedNext(units, start).start.getTime() !==
          shiftWith(units, start, STEPS).start.getTime()
        );
      });
      expect(drifted).toStrictEqual([]);
    }
  );
});
