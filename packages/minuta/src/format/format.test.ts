import { createPeriod, derivePeriod } from "#src/operations/period";
import { describe, expect, it } from "vitest";
import { formatPeriod, formatRange } from "./format";
import { createNativeAdapter } from "#src/adapters/native/adapter";

const adapter = createNativeAdapter();
const MARCH_15 = new Date("2026-03-15T00:00:00");

describe("formatPeriod() day and month", () => {
  it("formats a day period in de-CH", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const period = derivePeriod(adapter, MARCH_15, "day");
    const result = formatPeriod(period, "de-CH");
    expect(result).toContain("15");
    expect(result).toContain("März");
    expect(result).toContain("2026");
  });

  it("formats a day period in en-US", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const period = derivePeriod(adapter, MARCH_15, "day");
    const result = formatPeriod(period, "en-US");
    expect(result).toContain("March");
    expect(result).toContain("15");
    expect(result).toContain("2026");
  });

  it("formats a month period in de-CH", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const period = derivePeriod(adapter, MARCH_15, "month");
    const result = formatPeriod(period, "de-CH");
    expect(result).toContain("März");
    expect(result).toContain("2026");
  });

  it("formats a month period in en-US", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const period = derivePeriod(adapter, MARCH_15, "month");
    const result = formatPeriod(period, "en-US");
    expect(result).toContain("March");
    expect(result).toContain("2026");
  });
});

describe("formatPeriod() year and week", () => {
  it("formats a year period", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const period = derivePeriod(
      adapter,
      new Date("2026-01-01T00:00:00"),
      "year"
    );
    const result = formatPeriod(period, "de-CH");
    expect(result).toContain("2026");
  });

  it("formats a week period as a range", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const period = derivePeriod(
      adapter,
      new Date("2026-03-11T00:00:00"),
      "week"
    );
    const result = formatPeriod(period, "de-CH");
    // Week should be formatted as a range
    expect(result).toMatch(/\d.*–.*\d/u);
  });

  it("formats a week period in en-US as a range", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const period = derivePeriod(
      adapter,
      new Date("2026-03-11T00:00:00"),
      "week"
    );
    const result = formatPeriod(period, "en-US");
    expect(result).toMatch(/\d.*–.*\d/u);
  });
});

describe("formatRange()", () => {
  it("formats same-month range in de-CH", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const period = createPeriod(
      new Date("2026-03-01T00:00:00"),
      new Date("2026-03-31T00:00:00")
    );
    const result = formatRange(period, "de-CH");
    expect(result).toContain("März");
    expect(result).toContain("2026");
  });

  it("formats cross-month range in de-CH", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const period = createPeriod(
      new Date("2026-03-30T00:00:00"),
      new Date("2026-04-05T00:00:00")
    );
    const result = formatRange(period, "de-CH");
    expect(result).toContain("2026");
  });

  it("formats cross-year range in en-US", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const period = createPeriod(
      new Date("2025-12-29T00:00:00"),
      new Date("2026-01-04T00:00:00")
    );
    const result = formatRange(period, "en-US");
    expect(result).toContain("2025");
    expect(result).toContain("2026");
  });
});
