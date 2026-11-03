import { afterEach, describe, expect, it } from "vitest";

const YEAR = 2026;
const MARCH = 2;
const MID_MONTH = 15;
const FIRST_DAY = 1;
const ONE_MONTH = 1;

const MISSING_TEMPORAL =
  "minuta needs Temporal: await temporalReady() first, or run on Chrome 144+, Firefox 139+, Node 26+";

// Put the Temporal of the test setup back
async function restoreTemporal(): Promise<void> {
  const { temporalReady } = await import("#src/temporal");
  await temporalReady();
}

describe("minuta/temporal reads globalThis.Temporal", () => {
  afterEach(restoreTemporal);

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

  it(
    "names temporalReady when the runtime has no Temporal",
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();
      const { temporalUnits } = await import("#src/temporal");
      Reflect.deleteProperty(globalThis, "Temporal");
      const units = temporalUnits();
      expect(() =>
        units.month.add(new Date(YEAR, MARCH, MID_MONTH), ONE_MONTH)
      ).toThrow(MISSING_TEMPORAL);
    }
  );
});

describe("temporalReady", () => {
  afterEach(restoreTemporal);

  it(
    "installs the polyfill where Temporal is missing",
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();
      const { temporalReady, temporalUnits } = await import("#src/temporal");
      Reflect.deleteProperty(globalThis, "Temporal");
      await temporalReady();
      expect("Temporal" in globalThis).toBe(true);
      const units = temporalUnits();
      expect(
        units.month.add(new Date(YEAR, MARCH, MID_MONTH), ONE_MONTH)
      ).toStrictEqual(new Date(YEAR, MARCH + ONE_MONTH, MID_MONTH));
    }
  );

  it(
    "keeps the runtime's Temporal when it has one",
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();
      const before = Object.getOwnPropertyDescriptor(globalThis, "Temporal");
      const { temporalReady } = await import("#src/temporal");
      await temporalReady();
      expect(
        Object.getOwnPropertyDescriptor(globalThis, "Temporal")
      ).toStrictEqual(before);
    }
  );
});
