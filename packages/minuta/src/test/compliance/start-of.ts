import { describe, expect, it } from "vitest";
import type { ComplianceContext } from "./context";

function registerStartOfYearQuarterTests(ctx: ComplianceContext): void {
  const { adapter, parts, testDate } = ctx;
  describe(`${ctx.adapterName} Adapter Compliance`, () => {
    describe("startOf operations", () => {
      it("should correctly calculate start of year", { timeout: 5000 }, () => {
        expect.hasAssertions();
        const result = parts(adapter.startOf(testDate, "year"));
        // January 1st, midnight
        expect(result).toStrictEqual({
          day: 1,
          hour: 0,
          millisecond: 0,
          minute: 0,
          monthIndex: 0,
          second: 0,
          year: 2024,
        });
      });

      it(
        "should correctly calculate start of quarter",
        { timeout: 5000 },
        () => {
          expect.hasAssertions();
          const { day, hour, monthIndex, year } = parts(
            adapter.startOf(testDate, "quarter")
          );
          // April (Q2)
          expect({ day, hour, monthIndex, year }).toStrictEqual({
            day: 1,
            hour: 0,
            monthIndex: 3,
            year: 2024,
          });
        }
      );
    });
  });
}

function registerStartOfMonthWeekTests(ctx: ComplianceContext): void {
  const { adapter, parts, testDate } = ctx;
  describe(`${ctx.adapterName} Adapter Compliance`, () => {
    describe("startOf operations", () => {
      it("should correctly calculate start of month", { timeout: 5000 }, () => {
        expect.hasAssertions();
        const { day, hour, monthIndex, year } = parts(
          adapter.startOf(testDate, "month")
        );
        // June
        expect({ day, hour, monthIndex, year }).toStrictEqual({
          day: 1,
          hour: 0,
          monthIndex: 5,
          year: 2024,
        });
      });

      it("should correctly calculate start of week", { timeout: 5000 }, () => {
        expect.hasAssertions();
        /*
         * June 15, 2024 is a Saturday
         * This test assumes Monday as start of week (weekStartsOn: 1)
         */
        const { day, hour, monthIndex, year } = parts(
          adapter.startOf(testDate, "week")
        );
        // Monday June 10
        expect({ day, hour, monthIndex, year }).toStrictEqual({
          day: 10,
          hour: 0,
          monthIndex: 5,
          year: 2024,
        });
      });
    });
  });
}

function registerStartOfDayHourTests(ctx: ComplianceContext): void {
  const { adapter, parts, testDate } = ctx;
  describe(`${ctx.adapterName} Adapter Compliance`, () => {
    describe("startOf operations", () => {
      it("should correctly calculate start of day", { timeout: 5000 }, () => {
        expect.hasAssertions();
        const result = parts(adapter.startOf(testDate, "day"));
        expect(result).toStrictEqual({
          day: 15,
          hour: 0,
          millisecond: 0,
          minute: 0,
          monthIndex: 5,
          second: 0,
          year: 2024,
        });
      });

      it("should correctly calculate start of hour", { timeout: 5000 }, () => {
        expect.hasAssertions();
        const { hour, millisecond, minute, second } = parts(
          adapter.startOf(testDate, "hour")
        );
        expect({ hour, millisecond, minute, second }).toStrictEqual({
          hour: 14,
          millisecond: 0,
          minute: 0,
          second: 0,
        });
      });
    });
  });
}

function registerStartOfMinuteSecondTests(ctx: ComplianceContext): void {
  const { adapter, parts, testDate } = ctx;
  describe(`${ctx.adapterName} Adapter Compliance`, () => {
    describe("startOf operations", () => {
      it(
        "should correctly calculate start of minute",
        { timeout: 5000 },
        () => {
          expect.hasAssertions();
          const { millisecond, minute, second } = parts(
            adapter.startOf(testDate, "minute")
          );
          expect({ millisecond, minute, second }).toStrictEqual({
            millisecond: 0,
            minute: 30,
            second: 0,
          });
        }
      );

      it(
        "should correctly calculate start of second",
        { timeout: 5000 },
        () => {
          expect.hasAssertions();
          const { millisecond, second } = parts(
            adapter.startOf(testDate, "second")
          );
          expect({ millisecond, second }).toStrictEqual({
            millisecond: 0,
            second: 45,
          });
        }
      );
    });
  });
}

/**
 * Register all suites of this group in declaration order.
 * @param ctx - The compliance context
 */
function registerStartOfTests(ctx: ComplianceContext): void {
  registerStartOfYearQuarterTests(ctx);
  registerStartOfMonthWeekTests(ctx);
  registerStartOfDayHourTests(ctx);
  registerStartOfMinuteSecondTests(ctx);
}

export { registerStartOfTests };
