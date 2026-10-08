import { describe, expect, it } from "vitest";
import type { ComplianceContext } from "./context";

function registerDiffYearMonthTests(ctx: ComplianceContext): void {
  const { adapter, createDate } = ctx;
  describe(`${ctx.adapterName} Adapter Compliance`, () => {
    describe("diff operations", () => {
      // Jan 1, 2024
      const date1 = createDate({ day: 1, month: 0, year: 2024 });
      // June 15, 2024
      const date2 = createDate({ day: 15, month: 5, year: 2024 });

      it("should calculate year difference", { timeout: 5000 }, () => {
        expect.hasAssertions();
        const diff = adapter.diff(date1, date2, "year");
        // Same year
        expect({ diff }).toStrictEqual({ diff: 0 });

        const date3 = createDate({ day: 1, month: 0, year: 2026 });
        const diff2 = adapter.diff(date1, date3, "year");
        expect({ diff2 }).toStrictEqual({ diff2: 2 });
      });

      it("should calculate month difference", { timeout: 5000 }, () => {
        expect.hasAssertions();
        const diff = adapter.diff(date1, date2, "month");
        // 5 months difference
        expect({ diff }).toStrictEqual({ diff: 5 });
      });
    });
  });
}

function registerDiffDayTests(ctx: ComplianceContext): void {
  const { adapter, createDate } = ctx;
  describe(`${ctx.adapterName} Adapter Compliance`, () => {
    describe("diff operations", () => {
      // Jan 1, 2024
      const date1 = createDate({ day: 1, month: 0, year: 2024 });
      // June 15, 2024
      const date2 = createDate({ day: 15, month: 5, year: 2024 });

      it("should calculate day difference", { timeout: 5000 }, () => {
        expect.hasAssertions();
        const minDays = 165;
        const maxDays = 166;
        const diff = adapter.diff(date1, date2, "day");
        // Different adapters may calculate this slightly differently due to time handling
        expect(diff).toBeGreaterThanOrEqual(minDays);
        expect(diff).toBeLessThanOrEqual(maxDays);
      });

      it("should handle negative differences", { timeout: 5000 }, () => {
        expect.hasAssertions();
        const minMonths = -6;
        const maxMonths = -5;
        const diff = adapter.diff(date2, date1, "month");
        // Different adapters may calculate this slightly differently
        expect(diff).toBeGreaterThanOrEqual(minMonths);
        expect(diff).toBeLessThanOrEqual(maxMonths);
      });
    });
  });
}

function registerDiffQuarterTests(ctx: ComplianceContext): void {
  const { adapter, createDate } = ctx;
  describe(`${ctx.adapterName} Adapter Compliance`, () => {
    describe("diff operations", () => {
      it("should calculate quarter difference", { timeout: 5000 }, () => {
        expect.hasAssertions();
        const minQuarters = 1;
        const maxQuarters = 2;
        // End of Q1
        const q1Date = createDate({ day: 31, month: 2, year: 2024 });
        // End of Q3
        const q3Date = createDate({ day: 30, month: 8, year: 2024 });
        const diff = adapter.diff(q1Date, q3Date, "quarter");
        // Different adapters may calculate quarter boundaries differently
        expect(diff).toBeGreaterThanOrEqual(minQuarters);
        expect(diff).toBeLessThanOrEqual(maxQuarters);
      });
    });
  });
}

/**
 * Register all suites of this group in declaration order.
 * @param ctx - The compliance context
 */
function registerDiffTests(ctx: ComplianceContext): void {
  registerDiffYearMonthTests(ctx);
  registerDiffDayTests(ctx);
  registerDiffQuarterTests(ctx);
}

export { registerDiffTests };
