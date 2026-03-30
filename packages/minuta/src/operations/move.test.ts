import { describe, it, expect } from "vitest";
import { move } from "./move";
import { createPeriod } from "./period";

describe("move", () => {
  it("relocates a period to a target date", () => {
    const appointment = createPeriod(
      new Date(2026, 2, 29, 9, 0),
      new Date(2026, 2, 29, 10, 0)
    );
    const result = move(appointment, new Date(2026, 3, 2, 14, 0));
    expect(result.start).toEqual(new Date(2026, 3, 2, 14, 0));
    expect(result.end).toEqual(new Date(2026, 3, 2, 15, 0));
  });

  it("preserves duration", () => {
    const period = createPeriod(
      new Date(2024, 0, 1, 0, 0),
      new Date(2024, 0, 3, 12, 0)
    );
    const result = move(period, new Date(2024, 5, 15, 8, 0));
    const originalMs = period.end.getTime() - period.start.getTime();
    const resultMs = result.end.getTime() - result.start.getTime();
    expect(resultMs).toBe(originalMs);
  });

  it("returns type custom", () => {
    const period = createPeriod(new Date(2024, 0, 1), new Date(2024, 0, 31));
    expect(move(period, new Date(2024, 5, 1)).type).toBe("custom");
  });

  it("handles zero-duration period", () => {
    const point = createPeriod(
      new Date(2024, 0, 1, 12, 0),
      new Date(2024, 0, 1, 12, 0)
    );
    const result = move(point, new Date(2024, 5, 15));
    expect(result.start).toEqual(result.end);
  });
});
