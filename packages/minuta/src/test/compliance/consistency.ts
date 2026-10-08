import { describe, expect, it } from "vitest";
import type { AdapterUnit } from "#src/types";
import type { ComplianceContext } from "./context";

const REVERSIBLE_UNITS: readonly AdapterUnit[] = [
  "year",
  "month",
  "week",
  "day",
  "hour",
  "minute",
  "second",
];

const BOUNDED_UNITS: readonly AdapterUnit[] = [
  "year",
  "month",
  "day",
  "hour",
  "minute",
  "second",
];

function registerConsistencyTests(ctx: ComplianceContext): void {
  const { adapter, testDate } = ctx;
  describe(`${ctx.adapterName} Adapter Compliance`, () => {
    describe("consistency checks", () => {
      it("should be reversible: add then subtract", { timeout: 5000 }, () => {
        expect.hasAssertions();
        const amount = 5;
        const toleranceMs = 1000;

        for (const unit of REVERSIBLE_UNITS) {
          const added = adapter.add(testDate, amount, unit);
          const subtracted = adapter.add(added, -amount, unit);

          // Should return to original date (within millisecond precision)
          expect(
            Math.abs(subtracted.getTime() - testDate.getTime())
          ).toBeLessThan(toleranceMs);
        }
      });

      it(
        "should have consistent startOf/endOf relationship",
        { timeout: 5000 },
        () => {
          expect.hasAssertions();
          for (const unit of BOUNDED_UNITS) {
            const start = adapter.startOf(testDate, unit);
            const end = adapter.endOf(testDate, unit);

            // End should be after start
            expect(end.getTime()).toBeGreaterThan(start.getTime());

            // Should be in the same period
            expect(adapter.startOf(start, unit).getTime()).toBe(
              adapter.startOf(end, unit).getTime()
            );
          }
        }
      );
    });
  });
}

export { registerConsistencyTests };
