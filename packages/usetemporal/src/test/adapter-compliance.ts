import { describe, it, expect } from "vitest";
import { Temporal } from "@js-temporal/polyfill";
import type { Adapter, AdapterUnit } from "../types";

/**
 * Compliance test suite that all adapters must pass
 * This ensures consistent behavior across different date library integrations
 */
export function testAdapterCompliance(
  adapterName: string,
  adapter: Adapter,
  options?: { timezone?: string }
) {
  describe(`${adapterName} Adapter Compliance`, () => {
    // When testing a UTC-based adapter, construct dates as UTC so local TZ doesn't skew results
    const isUTC = options?.timezone === "UTC";
    const createDate = (...args: Parameters<typeof Date.UTC>) =>
      isUTC ? new Date(Date.UTC(...args)) : new Date(...args);

    const testDate = createDate(2024, 5, 15, 14, 30, 45, 123); // June 15, 2024 14:30:45.123
    const resolvedTimeZone =
      options?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;

    const toZoned = (date: Date) =>
      Temporal.Instant.from(date.toISOString()).toZonedDateTimeISO(
        resolvedTimeZone
      );
    const getYear = (date: Date) => toZoned(date).year;
    const getMonthIndex = (date: Date) => toZoned(date).month - 1;
    const getDayOfMonth = (date: Date) => toZoned(date).day;
    const getHour = (date: Date) => toZoned(date).hour;
    const getMinute = (date: Date) => toZoned(date).minute;
    const getSecond = (date: Date) => toZoned(date).second;
    const getMillisecond = (date: Date) => toZoned(date).millisecond;

    describe("startOf operations", () => {
      it("should correctly calculate start of year", () => {
        const result = adapter.startOf(testDate, "year");
        expect(getYear(result)).toBe(2024);
        expect(getMonthIndex(result)).toBe(0); // January
        expect(getDayOfMonth(result)).toBe(1);
        expect(getHour(result)).toBe(0);
        expect(getMinute(result)).toBe(0);
        expect(getSecond(result)).toBe(0);
        expect(getMillisecond(result)).toBe(0);
      });

      it("should correctly calculate start of quarter", () => {
        const result = adapter.startOf(testDate, "quarter");
        expect(getYear(result)).toBe(2024);
        expect(getMonthIndex(result)).toBe(3); // April (Q2)
        expect(getDayOfMonth(result)).toBe(1);
        expect(getHour(result)).toBe(0);
      });

      it("should correctly calculate start of month", () => {
        const result = adapter.startOf(testDate, "month");
        expect(getYear(result)).toBe(2024);
        expect(getMonthIndex(result)).toBe(5); // June
        expect(getDayOfMonth(result)).toBe(1);
        expect(getHour(result)).toBe(0);
      });

      it("should correctly calculate start of week", () => {
        // June 15, 2024 is a Saturday
        // This test assumes Monday as start of week (weekStartsOn: 1)
        const result = adapter.startOf(testDate, "week");
        expect(getYear(result)).toBe(2024);
        expect(getMonthIndex(result)).toBe(5); // June
        expect(getDayOfMonth(result)).toBe(10); // Monday June 10
        expect(getHour(result)).toBe(0);
      });

      it("should correctly calculate start of day", () => {
        const result = adapter.startOf(testDate, "day");
        expect(getYear(result)).toBe(2024);
        expect(getMonthIndex(result)).toBe(5);
        expect(getDayOfMonth(result)).toBe(15);
        expect(getHour(result)).toBe(0);
        expect(getMinute(result)).toBe(0);
        expect(getSecond(result)).toBe(0);
        expect(getMillisecond(result)).toBe(0);
      });

      it("should correctly calculate start of hour", () => {
        const result = adapter.startOf(testDate, "hour");
        expect(getHour(result)).toBe(14);
        expect(getMinute(result)).toBe(0);
        expect(getSecond(result)).toBe(0);
        expect(getMillisecond(result)).toBe(0);
      });

      it("should correctly calculate start of minute", () => {
        const result = adapter.startOf(testDate, "minute");
        expect(getMinute(result)).toBe(30);
        expect(getSecond(result)).toBe(0);
        expect(getMillisecond(result)).toBe(0);
      });

      it("should correctly calculate start of second", () => {
        const result = adapter.startOf(testDate, "second");
        expect(getSecond(result)).toBe(45);
        expect(getMillisecond(result)).toBe(0);
      });
    });

    describe("endOf operations", () => {
      it("should correctly calculate end of year", () => {
        const result = adapter.endOf(testDate, "year");
        expect(getYear(result)).toBe(2024);
        expect(getMonthIndex(result)).toBe(11); // December
        expect(getDayOfMonth(result)).toBe(31);
        expect(getHour(result)).toBe(23);
        expect(getMinute(result)).toBe(59);
        expect(getSecond(result)).toBe(59);
        expect(getMillisecond(result)).toBe(999);
      });

      it("should correctly calculate end of month", () => {
        const result = adapter.endOf(testDate, "month");
        expect(getYear(result)).toBe(2024);
        expect(getMonthIndex(result)).toBe(5); // June
        expect(getDayOfMonth(result)).toBe(30); // June has 30 days
        expect(getHour(result)).toBe(23);
        expect(getMinute(result)).toBe(59);
        expect(getSecond(result)).toBe(59);
        expect(getMillisecond(result)).toBe(999);
      });

      it("should handle February in leap year", () => {
        const febDate = createDate(2024, 1, 15); // February 15, 2024
        const result = adapter.endOf(febDate, "month");
        expect(getDayOfMonth(result)).toBe(29); // 2024 is a leap year
      });

      it("should handle February in non-leap year", () => {
        const febDate = createDate(2023, 1, 15); // February 15, 2023
        const result = adapter.endOf(febDate, "month");
        expect(getDayOfMonth(result)).toBe(28); // 2023 is not a leap year
      });
    });

    describe("add operations", () => {
      it("should add years correctly", () => {
        const result = adapter.add(testDate, 2, "year");
        expect(getYear(result)).toBe(2026);
        expect(getMonthIndex(result)).toBe(5); // Should preserve month
        expect(getDayOfMonth(result)).toBe(15); // Should preserve date
      });

      it("should add months correctly", () => {
        const result = adapter.add(testDate, 3, "month");
        expect(getYear(result)).toBe(2024);
        expect(getMonthIndex(result)).toBe(8); // September
        expect(getDayOfMonth(result)).toBe(15);
      });

      it("should handle month overflow", () => {
        const result = adapter.add(testDate, 8, "month");
        expect(getYear(result)).toBe(2025);
        expect(getMonthIndex(result)).toBe(1); // February
      });

      it("should add weeks correctly", () => {
        const result = adapter.add(testDate, 2, "week");
        expect(getDayOfMonth(result)).toBe(29); // June 15 + 14 days = June 29
      });

      it("should add days correctly", () => {
        const result = adapter.add(testDate, 20, "day");
        expect(getMonthIndex(result)).toBe(6); // July
        expect(getDayOfMonth(result)).toBe(5); // July 5
      });

      it("should handle negative values", () => {
        const result = adapter.add(testDate, -2, "month");
        expect(getMonthIndex(result)).toBe(3); // April
      });

      it("should handle daylight saving time transitions", () => {
        // This is a conceptual test - actual DST handling depends on the environment
        const dstDate = createDate(2024, 2, 10, 2, 0, 0); // March 10, 2024 2:00 AM
        const result = adapter.add(dstDate, 1, "day");
        expect(getDayOfMonth(result)).toBe(11);
      });
    });

    describe("diff operations", () => {
      const date1 = createDate(2024, 0, 1); // Jan 1, 2024
      const date2 = createDate(2024, 5, 15); // June 15, 2024

      it("should calculate year difference", () => {
        const diff = adapter.diff(date1, date2, "year");
        expect(diff).toBe(0); // Same year

        const date3 = createDate(2026, 0, 1);
        const diff2 = adapter.diff(date1, date3, "year");
        expect(diff2).toBe(2);
      });

      it("should calculate month difference", () => {
        const diff = adapter.diff(date1, date2, "month");
        expect(diff).toBe(5); // 5 months difference
      });

      it("should calculate day difference", () => {
        const diff = adapter.diff(date1, date2, "day");
        // Different adapters may calculate this slightly differently due to time handling
        expect(diff).toBeGreaterThanOrEqual(165);
        expect(diff).toBeLessThanOrEqual(166);
      });

      it("should handle negative differences", () => {
        const diff = adapter.diff(date2, date1, "month");
        // Different adapters may calculate this slightly differently
        expect(diff).toBeGreaterThanOrEqual(-6);
        expect(diff).toBeLessThanOrEqual(-5);
      });

      it("should calculate quarter difference", () => {
        const q1Date = createDate(2024, 2, 31); // End of Q1
        const q3Date = createDate(2024, 8, 30); // End of Q3
        const diff = adapter.diff(q1Date, q3Date, "quarter");
        // Different adapters may calculate quarter boundaries differently
        expect(diff).toBeGreaterThanOrEqual(1);
        expect(diff).toBeLessThanOrEqual(2);
      });
    });

    describe("edge cases", () => {
      it("should handle month-end dates correctly", () => {
        const jan31 = createDate(2024, 0, 31);
        const result = adapter.add(jan31, 1, "month");
        // JavaScript's setMonth handles overflow - Jan 31 + 1 month = Feb 31 = Mar 3 (in leap year)
        // This is expected behavior for the native JavaScript Date handling
        // Different adapters may handle this differently (e.g., clamping to Feb 29)
        // The exact behavior depends on the adapter implementation
        // For native JS: Jan 31 + 1 month = Feb 31 (overflow) = Mar 2
        expect([1, 2]).toContain(getMonthIndex(result)); // February or March
        if (getMonthIndex(result) === 1) {
          // If February, should be last day of Feb
          expect(getDayOfMonth(result)).toBeLessThanOrEqual(29);
        } else {
          // If March, should be early March
          expect(getDayOfMonth(result)).toBeLessThanOrEqual(3);
        }
      });

      it("should preserve time components when appropriate", () => {
        const result = adapter.add(testDate, 1, "day");
        expect(getHour(result)).toBe(14);
        expect(getMinute(result)).toBe(30);
        expect(getSecond(result)).toBe(45);
        expect(getMillisecond(result)).toBe(123);
      });

      it("should handle year boundaries", () => {
        const dec31 = createDate(2024, 11, 31);
        const nextDay = adapter.add(dec31, 1, "day");
        expect(getYear(nextDay)).toBe(2025);
        expect(getMonthIndex(nextDay)).toBe(0);
        expect(getDayOfMonth(nextDay)).toBe(1);
      });
    });

    describe("consistency checks", () => {
      it("should be reversible: add then subtract", () => {
        const units: AdapterUnit[] = [
          "year",
          "month",
          "week",
          "day",
          "hour",
          "minute",
          "second",
        ];

        units.forEach((unit) => {
          const added = adapter.add(testDate, 5, unit);
          const subtracted = adapter.add(added, -5, unit);

          // Should return to original date (within millisecond precision)
          expect(
            Math.abs(subtracted.getTime() - testDate.getTime())
          ).toBeLessThan(1000);
        });
      });

      it("should have consistent startOf/endOf relationship", () => {
        const units: AdapterUnit[] = [
          "year",
          "month",
          "day",
          "hour",
          "minute",
          "second",
        ];

        units.forEach((unit) => {
          const start = adapter.startOf(testDate, unit);
          const end = adapter.endOf(testDate, unit);

          // End should be after start
          expect(end.getTime()).toBeGreaterThan(start.getTime());

          // Should be in the same period
          expect(adapter.startOf(start, unit).getTime()).toBe(
            adapter.startOf(end, unit).getTime()
          );
        });
      });
    });
  });
}
