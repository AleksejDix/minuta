import { describe, expect, it } from "vitest";
import type { ComplianceContext } from "./context";

function registerEndOfPeriodTests(ctx: ComplianceContext): void {
  const { adapter, parts, testDate } = ctx;
  describe(`${ctx.adapterName} Adapter Compliance`, () => {
    describe("endOf operations", () => {
      it("should correctly calculate end of year", { timeout: 5000 }, () => {
        expect.hasAssertions();
        const result = parts(adapter.endOf(testDate, "year"));
        // December 31st, last millisecond
        expect(result).toStrictEqual({
          day: 31,
          hour: 23,
          millisecond: 999,
          minute: 59,
          monthIndex: 11,
          second: 59,
          year: 2024,
        });
      });

      it("should correctly calculate end of month", { timeout: 5000 }, () => {
        expect.hasAssertions();
        const result = parts(adapter.endOf(testDate, "month"));
        // June has 30 days
        expect(result).toStrictEqual({
          day: 30,
          hour: 23,
          millisecond: 999,
          minute: 59,
          monthIndex: 5,
          second: 59,
          year: 2024,
        });
      });
    });
  });
}

function registerEndOfFebruaryTests(ctx: ComplianceContext): void {
  const { adapter, createDate, parts } = ctx;
  describe(`${ctx.adapterName} Adapter Compliance`, () => {
    describe("endOf operations", () => {
      it("should handle February in leap year", { timeout: 5000 }, () => {
        expect.hasAssertions();
        // February 15, 2024
        const febDate = createDate({ day: 15, month: 1, year: 2024 });
        const { day } = parts(adapter.endOf(febDate, "month"));
        // 2024 is a leap year
        expect({ day }).toStrictEqual({ day: 29 });
      });

      it("should handle February in non-leap year", { timeout: 5000 }, () => {
        expect.hasAssertions();
        // February 15, 2023
        const febDate = createDate({ day: 15, month: 1, year: 2023 });
        const { day } = parts(adapter.endOf(febDate, "month"));
        // 2023 is not a leap year
        expect({ day }).toStrictEqual({ day: 28 });
      });
    });
  });
}

/**
 * Register all suites of this group in declaration order.
 * @param ctx - The compliance context
 */
function registerEndOfTests(ctx: ComplianceContext): void {
  registerEndOfPeriodTests(ctx);
  registerEndOfFebruaryTests(ctx);
}

export { registerEndOfTests };
