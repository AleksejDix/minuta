import { createPeriod, derivePeriod } from "./period";
import { describe, expect, it } from "vitest";
import { createNativeAdapter } from "#src/adapters/native/index";

const adapter = createNativeAdapter();

describe("createPeriod rejects invalid input", () => {
  it("throws on invalid dates", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(() =>
      createPeriod(new Date("invalid"), new Date("also-invalid"))
    ).toThrow("Period contains invalid date");
  });

  it("throws on reversed period (start > end)", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(() =>
      createPeriod(
        new Date("2024-06-15T00:00:00"),
        new Date("2024-01-01T00:00:00")
      )
    ).toThrow("must be before or equal to end");
  });

  it("accepts zero-duration period (start === end)", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(() =>
      createPeriod(
        new Date("2024-01-01T00:00:00"),
        new Date("2024-01-01T00:00:00")
      )
    ).not.toThrow();
  });
});

describe("derivePeriod always produces valid periods", () => {
  it("produces valid period from any date", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const month = derivePeriod(
      adapter,
      new Date("2024-01-15T00:00:00"),
      "month"
    );
    expect(month.start.getTime()).toBeLessThanOrEqual(month.end.getTime());
    expect(Number.isNaN(month.start.getTime())).toBe(false);
  });
});
