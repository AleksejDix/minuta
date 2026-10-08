import { describe, expect, it } from "vitest";
import { getAdapterTestCases } from "#src/test/shared-adapter-tests";
import { derivePeriod as period } from "./period";

const adapters = getAdapterTestCases();

describe.each(adapters)(
  "derivePeriod() calendar units with %s adapter",
  (_name, adapter) => {
    it("should create year periods correctly", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const year = period(adapter, new Date("2024-06-15T14:30:45"), "year");

      expect(year.type).toBe("year");
      expect(year.start).toStrictEqual(new Date("2024-01-01T00:00:00"));
      expect(year.end).toStrictEqual(new Date("2024-12-31T23:59:59.999"));
    });

    it("should create month periods correctly", { timeout: 5000 }, () => {
      expect.hasAssertions();
      // February
      const month = period(adapter, new Date("2024-02-15T00:00:00"), "month");

      expect(month.type).toBe("month");
      expect(month.start).toStrictEqual(new Date("2024-02-01T00:00:00"));
      // 2024 is a leap year
      expect(month.end).toStrictEqual(new Date("2024-02-29T23:59:59.999"));
    });

    it("should create week periods correctly", { timeout: 5000 }, () => {
      expect.hasAssertions();
      // Wednesday
      const date = new Date("2024-01-10T00:00:00");
      const week = period(adapter, date, "week");

      expect(week.type).toBe("week");
      // Week should start on Monday (weekStartsOn: 1) and end on Sunday
      expect(week.start).toStrictEqual(new Date("2024-01-08T00:00:00"));
      expect(week.end).toStrictEqual(new Date("2024-01-14T23:59:59.999"));

      // Check that the week contains the original date
      expect(week.start.getTime()).toBeLessThanOrEqual(date.getTime());
      expect(week.end.getTime()).toBeGreaterThanOrEqual(date.getTime());
    });

    it("should create day periods correctly", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const day = period(adapter, new Date("2024-01-15T14:30:45"), "day");

      expect(day.type).toBe("day");
      expect(day.start).toStrictEqual(new Date("2024-01-15T00:00:00"));
      expect(day.end).toStrictEqual(new Date("2024-01-15T23:59:59.999"));
    });
  }
);

describe.each(adapters)(
  "derivePeriod() clock units with %s adapter",
  (_name, adapter) => {
    it("should create hour periods correctly", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const hour = period(adapter, new Date("2024-01-15T14:30:45"), "hour");

      expect(hour.type).toBe("hour");
      expect(hour.start).toStrictEqual(new Date("2024-01-15T14:00:00"));
      expect(hour.end).toStrictEqual(new Date("2024-01-15T14:59:59.999"));
    });

    it("should create minute periods correctly", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const minute = period(adapter, new Date("2024-01-15T14:30:45"), "minute");

      expect(minute.type).toBe("minute");
      expect(minute.start).toStrictEqual(new Date("2024-01-15T14:30:00"));
      expect(minute.end).toStrictEqual(new Date("2024-01-15T14:30:59.999"));
    });

    it("should create second periods correctly", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const second = period(
        adapter,
        new Date("2024-01-15T14:30:45.500"),
        "second"
      );

      expect(second.type).toBe("second");
      expect(second.start).toStrictEqual(new Date("2024-01-15T14:30:45"));
      expect(second.end).toStrictEqual(new Date("2024-01-15T14:30:45.999"));
    });
  }
);

describe.each(adapters)(
  "derivePeriod() boundaries with %s adapter",
  (_name, adapter) => {
    it("should handle month boundaries correctly", { timeout: 5000 }, () => {
      expect.hasAssertions();
      // Test February in non-leap year
      const feb2023 = period(adapter, new Date("2023-02-15T00:00:00"), "month");
      expect(feb2023.end).toStrictEqual(new Date("2023-02-28T23:59:59.999"));

      // Test months with 30 days
      const april = period(adapter, new Date("2024-04-15T00:00:00"), "month");
      expect(april.end).toStrictEqual(new Date("2024-04-30T23:59:59.999"));

      // Test months with 31 days
      const january = period(adapter, new Date("2024-01-15T00:00:00"), "month");
      expect(january.end).toStrictEqual(new Date("2024-01-31T23:59:59.999"));
    });

    it("should handle year boundaries correctly", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const newYearsEve = new Date("2023-12-31T23:59:59");
      const day = period(adapter, newYearsEve, "day");

      expect(day.start).toStrictEqual(new Date("2023-12-31T00:00:00"));
      expect(day.end).toStrictEqual(new Date("2023-12-31T23:59:59.999"));

      const week = period(adapter, newYearsEve, "week");
      // Week might span across years
      expect(week.start.getTime()).toBeLessThanOrEqual(newYearsEve.getTime());
      expect(week.end.getTime()).toBeGreaterThanOrEqual(newYearsEve.getTime());
    });

    it(
      "should have start normalized to unit boundary",
      { timeout: 5000 },
      () => {
        expect.hasAssertions();
        const month = period(adapter, new Date("2024-06-15T14:30:00"), "month");
        // Start should be June 1, not June 15
        expect(month.start).toStrictEqual(new Date("2024-06-01T00:00:00"));
      }
    );
  }
);
