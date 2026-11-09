import { afterEach, describe, expect, it } from "vitest";
import { date } from "#src/test/temporal";

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
    await import("#src/temporal");
    const { createUnits } = await import("#src/index");
    expect(
      Object.getOwnPropertyDescriptor(globalThis, "Temporal")
    ).toStrictEqual(before);
    const units = createUnits();
    expect(units.month.startOf(date("2026-03-15")).toString()).toBe(
      "2026-03-01"
    );
  });

  it(
    "names temporalReady when the runtime has no Temporal",
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();
      const { createUnits } = await import("#src/index");
      Reflect.deleteProperty(globalThis, "Temporal");
      const units = createUnits();
      expect(() =>
        units.month.diff(date("2026-03-15"), date("2026-04-15"))
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
      const { temporalReady } = await import("#src/temporal");
      const { createUnits } = await import("#src/index");
      Reflect.deleteProperty(globalThis, "Temporal");
      await temporalReady();
      expect("Temporal" in globalThis).toBe(true);
      const units = createUnits();
      expect(units.month.add(date("2026-03-15"), ONE_MONTH).toString()).toBe(
        "2026-04-15"
      );
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
