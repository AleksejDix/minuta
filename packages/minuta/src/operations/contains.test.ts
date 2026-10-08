import { describe, expect, it } from "vitest";
import type { Period } from "#src/types";
import { contains } from "./contains";

describe("contains() with a date in long periods", () => {
  it("should check if year contains dates", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const year: Period = {
      end: new Date("2024-12-31T23:59:59.999"),
      start: new Date("2024-01-01T00:00"),
      unit: "year",
    };

    // First day
    expect(contains(year, new Date("2024-01-01T00:00"))).toBe(true);
    // Last day
    expect(contains(year, new Date("2024-12-31T00:00"))).toBe(true);
    // Mid-year
    expect(contains(year, new Date("2024-07-15T00:00"))).toBe(true);
    // Previous year
    expect(contains(year, new Date("2023-12-31T00:00"))).toBe(false);
    // Next year
    expect(contains(year, new Date("2025-01-01T00:00"))).toBe(false);
  });

  it("should check if month contains dates", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const february: Period = {
      // Leap year
      end: new Date("2024-02-29T23:59:59.999"),
      start: new Date("2024-02-01T00:00"),
      unit: "month",
    };

    // First day
    expect(contains(february, new Date("2024-02-01T00:00"))).toBe(true);
    // Last day (leap year)
    expect(contains(february, new Date("2024-02-29T00:00"))).toBe(true);
    // Mid-month
    expect(contains(february, new Date("2024-02-15T00:00"))).toBe(true);
    // Previous month
    expect(contains(february, new Date("2024-01-31T00:00"))).toBe(false);
    // Next month
    expect(contains(february, new Date("2024-03-01T00:00"))).toBe(false);
  });
});

describe("contains() with a date in short periods", () => {
  it("should check if week contains dates", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const week: Period = {
      // Sunday
      end: new Date("2024-01-14T23:59:59.999"),
      // Monday
      start: new Date("2024-01-08T00:00"),
      unit: "week",
    };

    // Monday
    expect(contains(week, new Date("2024-01-08T00:00"))).toBe(true);
    // Sunday
    expect(contains(week, new Date("2024-01-14T00:00"))).toBe(true);
    // Wednesday
    expect(contains(week, new Date("2024-01-10T00:00"))).toBe(true);
    // Previous Sunday
    expect(contains(week, new Date("2024-01-07T00:00"))).toBe(false);
    // Next Monday
    expect(contains(week, new Date("2024-01-15T00:00"))).toBe(false);
  });

  it("should check if day contains times", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const day: Period = {
      end: new Date("2024-01-15T23:59:59.999"),
      start: new Date("2024-01-15T00:00"),
      unit: "day",
    };

    // Start
    expect(contains(day, new Date("2024-01-15T00:00"))).toBe(true);
    // End
    expect(contains(day, new Date("2024-01-15T23:59:59"))).toBe(true);
    // Noon
    expect(contains(day, new Date("2024-01-15T12:30"))).toBe(true);
    // Next day
    expect(contains(day, new Date("2024-01-16T00:00"))).toBe(false);
  });
});

describe("contains() with a date in an hour", () => {
  it("should check if hour contains minutes", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const hour: Period = {
      end: new Date("2024-01-15T14:59:59.999"),
      start: new Date("2024-01-15T14:00"),
      unit: "hour",
    };

    // Start
    expect(contains(hour, new Date("2024-01-15T14:00"))).toBe(true);
    // End
    expect(contains(hour, new Date("2024-01-15T14:59:59"))).toBe(true);
    // Middle
    expect(contains(hour, new Date("2024-01-15T14:30"))).toBe(true);
    // Next hour
    expect(contains(hour, new Date("2024-01-15T15:00"))).toBe(false);
    // Previous hour
    expect(contains(hour, new Date("2024-01-15T13:59:59"))).toBe(false);
  });
});

describe("contains() with a period in long periods", () => {
  it("should check if year contains month", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const year: Period = {
      end: new Date("2024-12-31T23:59:59.999"),
      start: new Date("2024-01-01T00:00"),
      unit: "year",
    };

    const june2024: Period = {
      end: new Date("2024-06-30T23:59:59.999"),
      start: new Date("2024-06-01T00:00"),
      unit: "month",
    };

    const jan2025: Period = {
      end: new Date("2025-01-31T23:59:59.999"),
      start: new Date("2025-01-01T00:00"),
      unit: "month",
    };

    expect(contains(year, june2024)).toBe(true);
    expect(contains(year, jan2025)).toBe(false);
  });

  it("should check if month contains day", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const month: Period = {
      end: new Date("2024-02-29T23:59:59.999"),
      start: new Date("2024-02-01T00:00"),
      unit: "month",
    };

    const dayInMonth: Period = {
      end: new Date("2024-02-15T23:59:59.999"),
      start: new Date("2024-02-15T00:00"),
      unit: "day",
    };

    const dayOutsideMonth: Period = {
      end: new Date("2024-03-01T23:59:59.999"),
      start: new Date("2024-03-01T00:00"),
      unit: "day",
    };

    expect(contains(month, dayInMonth)).toBe(true);
    expect(contains(month, dayOutsideMonth)).toBe(false);
  });
});

describe("contains() with a period in short periods", () => {
  it("should check if week contains day", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const week: Period = {
      end: new Date("2024-01-14T23:59:59.999"),
      start: new Date("2024-01-08T00:00"),
      unit: "week",
    };

    const monday: Period = {
      end: new Date("2024-01-08T23:59:59.999"),
      start: new Date("2024-01-08T00:00"),
      unit: "day",
    };

    const nextMonday: Period = {
      end: new Date("2024-01-15T23:59:59.999"),
      start: new Date("2024-01-15T00:00"),
      unit: "day",
    };

    expect(contains(week, monday)).toBe(true);
    expect(contains(week, nextMonday)).toBe(false);
  });

  it("should check if day contains hour", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const day: Period = {
      end: new Date("2024-01-15T23:59:59.999"),
      start: new Date("2024-01-15T00:00"),
      unit: "day",
    };

    const morningHour: Period = {
      end: new Date("2024-01-15T08:59:59.999"),
      start: new Date("2024-01-15T08:00"),
      unit: "hour",
    };

    const nextDayHour: Period = {
      end: new Date("2024-01-16T00:59:59.999"),
      start: new Date("2024-01-16T00:00"),
      unit: "hour",
    };

    expect(contains(day, morningHour)).toBe(true);
    expect(contains(day, nextDayHour)).toBe(false);
  });
});

describe("contains() edge cases", () => {
  it("should handle boundary times correctly", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const day: Period = {
      end: new Date("2024-01-15T23:59:59.999"),
      start: new Date("2024-01-15T00:00"),
      unit: "day",
    };

    const startOfDay = new Date("2024-01-15T00:00");
    const endOfDay = new Date("2024-01-15T23:59:59.999");

    expect(contains(day, startOfDay)).toBe(true);
    expect(contains(day, endOfDay)).toBe(true);
  });

  it("should handle cross-month boundaries", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const january: Period = {
      end: new Date("2024-01-31T23:59:59.999"),
      start: new Date("2024-01-01T00:00"),
      unit: "month",
    };

    const lastDayJan = new Date("2024-01-31T23:59:59");
    const firstDayFeb = new Date("2024-02-01T00:00");

    expect(contains(january, lastDayJan)).toBe(true);
    expect(contains(january, firstDayFeb)).toBe(false);
  });
});
