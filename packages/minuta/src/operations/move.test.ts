import { describe, expect, it } from "vitest";
import { createPeriod } from "./period";
import { move } from "./move";

describe("move()", () => {
  it("relocates a period to a target date", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const appointment = createPeriod(
      new Date("2026-03-29T09:00:00"),
      new Date("2026-03-29T10:00:00")
    );
    const result = move(appointment, new Date("2026-04-02T14:00:00"));
    expect(result.start).toStrictEqual(new Date("2026-04-02T14:00:00"));
    expect(result.end).toStrictEqual(new Date("2026-04-02T15:00:00"));
  });

  it("preserves duration", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const period = createPeriod(
      new Date("2024-01-01T00:00:00"),
      new Date("2024-01-03T12:00:00")
    );
    const result = move(period, new Date("2024-06-15T08:00:00"));
    const originalMs = period.end.getTime() - period.start.getTime();
    const resultMs = result.end.getTime() - result.start.getTime();
    expect(resultMs).toBe(originalMs);
  });

  it("returns type custom", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const period = createPeriod(
      new Date("2024-01-01T00:00:00"),
      new Date("2024-01-31T00:00:00")
    );
    expect(move(period, new Date("2024-06-01T00:00:00")).type).toBe("custom");
  });

  it("handles zero-duration period", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const point = createPeriod(
      new Date("2024-01-01T12:00:00"),
      new Date("2024-01-01T12:00:00")
    );
    const result = move(point, new Date("2024-06-15T00:00:00"));
    expect(result.start).toStrictEqual(result.end);
  });
});
