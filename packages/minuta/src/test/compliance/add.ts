import { describe, expect, it } from "vitest";
import type { ComplianceContext } from "./context";

function registerAddYearMonthTests(ctx: ComplianceContext): void {
  const { adapter, parts, testDate } = ctx;
  describe(`${ctx.adapterName} Adapter Compliance`, () => {
    describe("add operations", () => {
      it("should add years correctly", { timeout: 5000 }, () => {
        expect.hasAssertions();
        const years = 2;
        const { day, monthIndex, year } = parts(
          adapter.add(testDate, years, "year")
        );
        // Should preserve month and date
        expect({ day, monthIndex, year }).toStrictEqual({
          day: 15,
          monthIndex: 5,
          year: 2026,
        });
      });

      it("should add months correctly", { timeout: 5000 }, () => {
        expect.hasAssertions();
        const months = 3;
        const { day, monthIndex, year } = parts(
          adapter.add(testDate, months, "month")
        );
        // September
        expect({ day, monthIndex, year }).toStrictEqual({
          day: 15,
          monthIndex: 8,
          year: 2024,
        });
      });
    });
  });
}

function registerAddOverflowWeekTests(ctx: ComplianceContext): void {
  const { adapter, parts, testDate } = ctx;
  describe(`${ctx.adapterName} Adapter Compliance`, () => {
    describe("add operations", () => {
      it("should handle month overflow", { timeout: 5000 }, () => {
        expect.hasAssertions();
        const months = 8;
        const { monthIndex, year } = parts(
          adapter.add(testDate, months, "month")
        );
        // February
        expect({ monthIndex, year }).toStrictEqual({
          monthIndex: 1,
          year: 2025,
        });
      });

      it("should add weeks correctly", { timeout: 5000 }, () => {
        expect.hasAssertions();
        const weeks = 2;
        const { day } = parts(adapter.add(testDate, weeks, "week"));
        // June 15 + 14 days = June 29
        expect({ day }).toStrictEqual({ day: 29 });
      });
    });
  });
}

function registerAddDayNegativeTests(ctx: ComplianceContext): void {
  const { adapter, parts, testDate } = ctx;
  describe(`${ctx.adapterName} Adapter Compliance`, () => {
    describe("add operations", () => {
      it("should add days correctly", { timeout: 5000 }, () => {
        expect.hasAssertions();
        const days = 20;
        const { day, monthIndex } = parts(adapter.add(testDate, days, "day"));
        // July 5
        expect({ day, monthIndex }).toStrictEqual({ day: 5, monthIndex: 6 });
      });

      it("should handle negative values", { timeout: 5000 }, () => {
        expect.hasAssertions();
        const months = -2;
        const { monthIndex } = parts(adapter.add(testDate, months, "month"));
        // April
        expect({ monthIndex }).toStrictEqual({ monthIndex: 3 });
      });
    });
  });
}

function registerAddQuarterTests(ctx: ComplianceContext): void {
  const { adapter, createDate, parts, testDate } = ctx;
  describe(`${ctx.adapterName} Adapter Compliance`, () => {
    describe("add operations", () => {
      it("should add quarters correctly", { timeout: 5000 }, () => {
        expect.hasAssertions();
        const quarters = 1;
        const { day, monthIndex, year } = parts(
          adapter.add(testDate, quarters, "quarter")
        );
        // September
        expect({ day, monthIndex, year }).toStrictEqual({
          day: 15,
          monthIndex: 8,
          year: 2024,
        });
      });

      it(
        "should clamp day-of-month when adding quarters",
        { timeout: 5000 },
        () => {
          expect.hasAssertions();
          const quarters = 1;
          const jan31 = createDate({ day: 31, month: 0, year: 2024 });
          const { day, monthIndex, year } = parts(
            adapter.add(jan31, quarters, "quarter")
          );
          // April has 30 days
          expect({ day, monthIndex, year }).toStrictEqual({
            day: 30,
            monthIndex: 3,
            year: 2024,
          });
        }
      );
    });
  });
}

function registerAddDstTests(ctx: ComplianceContext): void {
  const { adapter, createDate, parts } = ctx;
  describe(`${ctx.adapterName} Adapter Compliance`, () => {
    describe("add operations", () => {
      it(
        "should handle daylight saving time transitions",
        { timeout: 5000 },
        () => {
          expect.hasAssertions();
          const days = 1;
          // This is a conceptual test - actual DST handling depends on the environment
          // March 10, 2024 2:00 AM
          const dstDate = createDate({
            day: 10,
            hour: 2,
            month: 2,
            year: 2024,
          });
          const { day } = parts(adapter.add(dstDate, days, "day"));
          expect({ day }).toStrictEqual({ day: 11 });
        }
      );
    });
  });
}

/**
 * Register all suites of this group in declaration order.
 * @param ctx - The compliance context
 */
function registerAddTests(ctx: ComplianceContext): void {
  registerAddYearMonthTests(ctx);
  registerAddOverflowWeekTests(ctx);
  registerAddDayNegativeTests(ctx);
  registerAddQuarterTests(ctx);
  registerAddDstTests(ctx);
}

export { registerAddTests };
