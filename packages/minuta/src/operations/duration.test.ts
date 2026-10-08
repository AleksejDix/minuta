import { describe, expect, it } from "vitest";
import { duration } from "./duration";
import { range } from "./period";

const ONE_HOUR_MS = 3_600_000;
const ONE = 1;
const NINETY = 90;
const SECONDS_PER_HOUR = 3600;
const TWO_DAYS = 2;
const ZERO = 0;

const oneHour = range(
  new Date("2024-01-01T09:00"),
  new Date("2024-01-01T10:00")
);

const ninetyMinutes = range(
  new Date("2024-01-01T09:00"),
  new Date("2024-01-01T10:30")
);

const threeDays = range(
  new Date("2024-01-01T00:00"),
  new Date("2024-01-03T23:59:59.999")
);

describe("duration() in milliseconds", () => {
  it("returns milliseconds when no unit given", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(duration(oneHour)).toBe(ONE_HOUR_MS);
  });

  it("returns 0 for zero-width period", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const point = range(
      new Date("2024-01-01T00:00"),
      new Date("2024-01-01T00:00")
    );
    expect(duration(point)).toBe(ZERO);
    expect(duration(point, "hour")).toBe(ZERO);
  });
});

describe("duration() in units", () => {
  it("returns complete hours", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(duration(oneHour, "hour")).toBe(ONE);
    // Truncates
    expect(duration(ninetyMinutes, "hour")).toBe(ONE);
  });

  it("returns complete minutes", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(duration(ninetyMinutes, "minute")).toBe(NINETY);
  });

  it("returns complete seconds", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(duration(oneHour, "second")).toBe(SECONDS_PER_HOUR);
  });

  it("returns complete days", { timeout: 5000 }, () => {
    expect.hasAssertions();
    // 2.999... truncates to 2
    expect(duration(threeDays, "day")).toBe(TWO_DAYS);
  });
});
