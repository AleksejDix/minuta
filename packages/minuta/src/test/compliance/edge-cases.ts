import { describe, expect, it } from "vitest";
import type { ComplianceContext } from "./context";

function registerMonthEndEdgeTests(ctx: ComplianceContext): void {
  const { adapter, createDate, parts } = ctx;
  describe(`${ctx.adapterName} Adapter Compliance`, () => {
    describe("edge cases", () => {
      it("should handle month-end dates correctly", { timeout: 5000 }, () => {
        expect.hasAssertions();
        const months = 1;
        const jan31 = createDate({ day: 31, month: 0, year: 2024 });
        const { day, monthIndex } = parts(adapter.add(jan31, months, "month"));
        // Jan 31 + 1 month should clamp to Feb 29 in leap year
        expect({ day, monthIndex }).toStrictEqual({ day: 29, monthIndex: 1 });
      });

      it(
        "should clamp Feb 29 when adding 1 year to non-leap year",
        { timeout: 5000 },
        () => {
          expect.hasAssertions();
          const years = 1;
          // Feb 29, 2024 (leap year)
          const feb29 = createDate({ day: 29, month: 1, year: 2024 });
          const { day, monthIndex, year } = parts(
            adapter.add(feb29, years, "year")
          );
          // 2025 is not a leap year
          expect({ day, monthIndex, year }).toStrictEqual({
            day: 28,
            monthIndex: 1,
            year: 2025,
          });
        }
      );
    });
  });
}

function registerLeapYearEdgeTests(ctx: ComplianceContext): void {
  const { adapter, createDate, parts } = ctx;
  describe(`${ctx.adapterName} Adapter Compliance`, () => {
    describe("edge cases", () => {
      it(
        "should preserve Feb 29 when adding 4 years to another leap year",
        { timeout: 5000 },
        () => {
          expect.hasAssertions();
          const years = 4;
          const feb29 = createDate({ day: 29, month: 1, year: 2024 });
          const { day, monthIndex, year } = parts(
            adapter.add(feb29, years, "year")
          );
          // 2028 is a leap year
          expect({ day, monthIndex, year }).toStrictEqual({
            day: 29,
            monthIndex: 1,
            year: 2028,
          });
        }
      );

      it(
        "should clamp Feb 29 when subtracting 1 year",
        { timeout: 5000 },
        () => {
          expect.hasAssertions();
          const years = -1;
          const feb29 = createDate({ day: 29, month: 1, year: 2024 });
          const { day, monthIndex, year } = parts(
            adapter.add(feb29, years, "year")
          );
          // 2023 is not a leap year
          expect({ day, monthIndex, year }).toStrictEqual({
            day: 28,
            monthIndex: 1,
            year: 2023,
          });
        }
      );
    });
  });
}

function registerYearEdgeTests(ctx: ComplianceContext): void {
  const { adapter, createDate, parts, testDate } = ctx;
  describe(`${ctx.adapterName} Adapter Compliance`, () => {
    describe("edge cases", () => {
      it(
        "should not affect non-Feb dates when adding years",
        { timeout: 5000 },
        () => {
          expect.hasAssertions();
          const years = 1;
          const jan31 = createDate({ day: 31, month: 0, year: 2024 });
          const { day, monthIndex, year } = parts(
            adapter.add(jan31, years, "year")
          );
          // January 31st
          expect({ day, monthIndex, year }).toStrictEqual({
            day: 31,
            monthIndex: 0,
            year: 2025,
          });
        }
      );

      it(
        "should preserve time components when appropriate",
        { timeout: 5000 },
        () => {
          expect.hasAssertions();
          const days = 1;
          const { hour, millisecond, minute, second } = parts(
            adapter.add(testDate, days, "day")
          );
          expect({ hour, millisecond, minute, second }).toStrictEqual({
            hour: 14,
            millisecond: 123,
            minute: 30,
            second: 45,
          });
        }
      );
    });
  });
}

function registerYearBoundaryEdgeTests(ctx: ComplianceContext): void {
  const { adapter, createDate, parts } = ctx;
  describe(`${ctx.adapterName} Adapter Compliance`, () => {
    describe("edge cases", () => {
      it("should handle year boundaries", { timeout: 5000 }, () => {
        expect.hasAssertions();
        const days = 1;
        const dec31 = createDate({ day: 31, month: 11, year: 2024 });
        const { day, monthIndex, year } = parts(
          adapter.add(dec31, days, "day")
        );
        expect({ day, monthIndex, year }).toStrictEqual({
          day: 1,
          monthIndex: 0,
          year: 2025,
        });
      });
    });
  });
}

/**
 * Register all suites of this group in declaration order.
 * @param ctx - The compliance context
 */
function registerEdgeCaseTests(ctx: ComplianceContext): void {
  registerMonthEndEdgeTests(ctx);
  registerLeapYearEdgeTests(ctx);
  registerYearEdgeTests(ctx);
  registerYearBoundaryEdgeTests(ctx);
}

export { registerEdgeCaseTests };
