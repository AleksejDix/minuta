import { describe, it, expect } from "vitest";
import { duration } from "./duration";
import { createPeriod } from "./period";

describe("duration", () => {
  const oneHour = createPeriod(
    new Date(2024, 0, 1, 9, 0),
    new Date(2024, 0, 1, 10, 0)
  );

  const ninetyMinutes = createPeriod(
    new Date(2024, 0, 1, 9, 0),
    new Date(2024, 0, 1, 10, 30)
  );

  const threeDays = createPeriod(
    new Date(2024, 0, 1),
    new Date(2024, 0, 3, 23, 59, 59, 999)
  );

  it("returns milliseconds when no unit given", () => {
    expect(duration(oneHour)).toBe(3_600_000);
  });

  it("returns complete hours", () => {
    expect(duration(oneHour, "hour")).toBe(1);
    expect(duration(ninetyMinutes, "hour")).toBe(1); // truncates
  });

  it("returns complete minutes", () => {
    expect(duration(ninetyMinutes, "minute")).toBe(90);
  });

  it("returns complete seconds", () => {
    expect(duration(oneHour, "second")).toBe(3600);
  });

  it("returns complete days", () => {
    expect(duration(threeDays, "day")).toBe(2); // 2.999... truncates to 2
  });

  it("returns 0 for zero-width period", () => {
    const point = createPeriod(new Date(2024, 0, 1), new Date(2024, 0, 1));
    expect(duration(point)).toBe(0);
    expect(duration(point, "hour")).toBe(0);
  });
});
