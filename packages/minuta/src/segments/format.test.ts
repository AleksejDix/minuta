import { describe, it, expect } from "vitest";
import { createNativeAdapter } from "../adapters/native/adapter";
import { derivePeriod, createPeriod } from "../operations/period";
import { formatPeriod, formatRange } from "./format";

const adapter = createNativeAdapter();

describe("formatPeriod", () => {
  it("formats a day period in de-CH", () => {
    const period = derivePeriod(adapter, new Date(2026, 2, 15), "day");
    const result = formatPeriod(period, "de-CH");
    expect(result).toContain("15");
    expect(result).toContain("März");
    expect(result).toContain("2026");
  });

  it("formats a day period in en-US", () => {
    const period = derivePeriod(adapter, new Date(2026, 2, 15), "day");
    const result = formatPeriod(period, "en-US");
    expect(result).toContain("March");
    expect(result).toContain("15");
    expect(result).toContain("2026");
  });

  it("formats a month period in de-CH", () => {
    const period = derivePeriod(adapter, new Date(2026, 2, 15), "month");
    const result = formatPeriod(period, "de-CH");
    expect(result).toContain("März");
    expect(result).toContain("2026");
  });

  it("formats a month period in en-US", () => {
    const period = derivePeriod(adapter, new Date(2026, 2, 15), "month");
    const result = formatPeriod(period, "en-US");
    expect(result).toContain("March");
    expect(result).toContain("2026");
  });

  it("formats a year period", () => {
    const period = derivePeriod(adapter, new Date(2026, 0, 1), "year");
    const result = formatPeriod(period, "de-CH");
    expect(result).toContain("2026");
  });

  it("formats a week period as a range", () => {
    const period = derivePeriod(adapter, new Date(2026, 2, 11), "week");
    const result = formatPeriod(period, "de-CH");
    // Week should be formatted as a range
    expect(result).toMatch(/\d.*–.*\d/);
  });

  it("formats a week period in en-US as a range", () => {
    const period = derivePeriod(adapter, new Date(2026, 2, 11), "week");
    const result = formatPeriod(period, "en-US");
    expect(result).toMatch(/\d.*–.*\d/);
  });
});

describe("formatRange", () => {
  it("formats same-month range in de-CH", () => {
    const period = createPeriod(new Date(2026, 2, 1), new Date(2026, 2, 31));
    const result = formatRange(period, "de-CH");
    expect(result).toContain("März");
    expect(result).toContain("2026");
  });

  it("formats cross-month range in de-CH", () => {
    const period = createPeriod(new Date(2026, 2, 30), new Date(2026, 3, 5));
    const result = formatRange(period, "de-CH");
    expect(result).toContain("2026");
  });

  it("formats cross-year range in en-US", () => {
    const period = createPeriod(new Date(2025, 11, 29), new Date(2026, 0, 4));
    const result = formatRange(period, "en-US");
    expect(result).toContain("2025");
    expect(result).toContain("2026");
  });
});
