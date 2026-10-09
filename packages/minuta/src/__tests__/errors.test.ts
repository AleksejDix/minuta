import { describe, expect, it } from "vitest";
import { periodWith, range } from "#src/operations/period";
import { MinutaError } from "#src/units";
import { divideWith } from "#src/operations/divide";
import { nativeUnits } from "#src/adapters/native/index";

const MAX_PERIODS = 10;

describe("error messages", () => {
  it(
    "names the missing unit, the available ones and the fix",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const { day, month } = nativeUnits();

      expect(() => periodWith({ day, month }, new Date(), "week")).toThrow(
        `${MinutaError.UnitNotSupported}: no "week" spec in the units passed (available: day, month). ` +
          'Pass a full set such as nativeUnits(), or add a "week" spec to your units.'
      );
    }
  );

  it("names the invalid argument and how to fix it", { timeout: 5000 }, () => {
    expect.hasAssertions();

    expect(() => range(new Date(), new Date("nope"))).toThrow(
      `${MinutaError.InvalidDate}: end is an invalid Date. ` +
        "Pass a valid Date such as new Date(2026, 0, 31), and check the string or numbers it was built from."
    );
  });

  it("gives divideWith's limit a code and a fix", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const units = nativeUnits();
    const year = periodWith(units, new Date("2026-01-01T00:00:00"), "year");

    expect(() =>
      divideWith(units, year, "day", { maxPeriods: MAX_PERIODS })
    ).toThrow(
      `${MinutaError.TooManyPeriods}: divideWith() generated over ${MAX_PERIODS} periods. ` +
        "Use a larger unit or step, a shorter period, or raise the maxPeriods option."
    );
  });
});
