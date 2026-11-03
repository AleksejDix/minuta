import { describe, expect, it } from "vitest";
import { MinutaError } from "#src/units";
import { date } from "#src/test/temporal";
import { divideWith } from "#src/operations/divide";
import { periodWith } from "#src/operations/period";
import { temporalUnits } from "#src/adapters/temporal/index";

const MAX_PERIODS = 10;
const ZERO = 0;
const NEGATIVE = -15;
const FRACTION = 1.5;
const INVALID_COUNTS: readonly number[] = [
  ZERO,
  NEGATIVE,
  FRACTION,
  Number.NaN,
];

describe("error messages", () => {
  it(
    "names the missing unit, the available ones and the fix",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const { day, month } = temporalUnits();

      expect(() =>
        periodWith({ day, month }, date("2026-03-18"), "week")
      ).toThrow(
        `${MinutaError.UnitNotSupported}: no "week" spec in the units passed (available: day, month). ` +
          'Pass a full set such as temporalUnits(), or add a "week" spec to your units.'
      );
    }
  );

  it("gives divideWith's limit a code and a fix", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const units = temporalUnits();
    const year = periodWith(units, date("2026-01-01"), "year");

    expect(() =>
      divideWith(units, year, "day", { maxPeriods: MAX_PERIODS })
    ).toThrow(
      `${MinutaError.TooManyPeriods}: divideWith() generated over ${MAX_PERIODS} periods. ` +
        "Use a larger unit or step, a shorter period, or raise the maxPeriods option."
    );
  });
});

describe("option errors", () => {
  it.each(INVALID_COUNTS)(
    "rejects step %s with a code and a fix",
    { timeout: 5000 },
    (step) => {
      expect.hasAssertions();
      const units = temporalUnits();
      const day = periodWith(units, date("2026-01-01"), "day");
      const fix = "must be a positive whole number";
      expect(() => divideWith(units, day, "hour", { step })).toThrow(
        `${MinutaError.InvalidOption}: divideWith() step ${fix}, got ${String(step)}. Pass a count such as 1 or 15.`
      );
      expect(() =>
        divideWith(units, day, "hour", { maxPeriods: step })
      ).toThrow(`${MinutaError.InvalidOption}: divideWith() maxPeriods ${fix}`);
    }
  );
});
