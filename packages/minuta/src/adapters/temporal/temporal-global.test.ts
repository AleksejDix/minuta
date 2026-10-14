import { describe, expect, it } from "vitest";

const YEAR = 2026;
const MARCH = 2;
const MID_MONTH = 15;
const FIRST_DAY = 1;

describe("minuta/temporal and globalThis.Temporal", () => {
  it("leaves the global alone on import", { timeout: 5000 }, async () => {
    expect.hasAssertions();
    const before = Object.getOwnPropertyDescriptor(globalThis, "Temporal");
    const { temporalUnits } = await import("#src/temporal");
    expect(
      Object.getOwnPropertyDescriptor(globalThis, "Temporal")
    ).toStrictEqual(before);
    const units = temporalUnits();
    const march = new Date(YEAR, MARCH, MID_MONTH);
    expect(units.month.startOf(march)).toStrictEqual(
      new Date(YEAR, MARCH, FIRST_DAY)
    );
  });
});
