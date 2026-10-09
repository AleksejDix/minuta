import { describe, expect, it } from "vitest";
import { formatPeriod, formatRange } from "./format";
import { periodWith, range } from "#src/operations/period";
import { dateFnsTzUnits } from "#src/adapters/date-fns-tz/index";
import { nativeUnits } from "#src/adapters/native/index";

const units = nativeUnits();
const MARCH_15 = new Date("2026-03-15T00:00:00");

describe("formatPeriod() day and month", () => {
  it("formats a day period in de-CH", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const period = periodWith(units, MARCH_15, "day");
    const result = formatPeriod(period, "de-CH");
    expect(result).toContain("15");
    expect(result).toContain("März");
    expect(result).toContain("2026");
  });

  it("formats a day period in en-US", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const period = periodWith(units, MARCH_15, "day");
    const result = formatPeriod(period, "en-US");
    expect(result).toContain("March");
    expect(result).toContain("15");
    expect(result).toContain("2026");
  });

  it("formats a month period in de-CH", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const period = periodWith(units, MARCH_15, "month");
    const result = formatPeriod(period, "de-CH");
    expect(result).toContain("März");
    expect(result).toContain("2026");
  });

  it("formats a month period in en-US", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const period = periodWith(units, MARCH_15, "month");
    const result = formatPeriod(period, "en-US");
    expect(result).toContain("March");
    expect(result).toContain("2026");
  });
});

describe("formatPeriod() year and week", () => {
  it("formats a year period", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const period = periodWith(units, new Date("2026-01-01T00:00:00"), "year");
    const result = formatPeriod(period, "de-CH");
    expect(result).toContain("2026");
  });

  it("formats a week period as a range", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const period = periodWith(units, new Date("2026-03-11T00:00:00"), "week");
    const result = formatPeriod(period, "de-CH");
    // Week should be formatted as a range
    expect(result).toMatch(/\d.*–.*\d/u);
  });

  it("formats a week period in en-US as a range", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const period = periodWith(units, new Date("2026-03-11T00:00:00"), "week");
    const result = formatPeriod(period, "en-US");
    expect(result).toMatch(/\d.*–.*\d/u);
  });
});

describe("formatRange()", () => {
  it("formats same-month range in de-CH", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const period = range(
      new Date("2026-03-01T00:00:00"),
      new Date("2026-03-31T00:00:00")
    );
    const result = formatRange(period, "de-CH");
    expect(result).toContain("März");
    expect(result).toContain("2026");
  });

  it("formats cross-month range in de-CH", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const period = range(
      new Date("2026-03-30T00:00:00"),
      new Date("2026-04-05T00:00:00")
    );
    const result = formatRange(period, "de-CH");
    expect(result).toContain("2026");
  });

  it("formats cross-year range in en-US", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const period = range(
      new Date("2025-12-29T00:00:00"),
      new Date("2026-01-04T00:00:00")
    );
    const result = formatRange(period, "en-US");
    expect(result).toContain("2025");
    expect(result).toContain("2026");
  });
});

describe("format options", () => {
  const tokyo = dateFnsTzUnits({ timezone: "Asia/Tokyo" });
  // 05:00 on March 21 in Tokyo, still March 20 in UTC and the Americas
  const tokyoDay = periodWith(tokyo, new Date("2026-03-20T20:00:00Z"), "day");

  it("formats in the units' time zone", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const options = { timeZone: tokyo.timeZone };
    expect(formatPeriod(tokyoDay, "en-US", options)).toBe("March 21, 2026");
    expect(formatRange(tokyoDay, "en-US", options)).toBe("March 21, 2026");
  });

  it("merges options over the unit's defaults", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(
      formatPeriod(tokyoDay, "en-US", {
        timeZone: "Asia/Tokyo",
        weekday: "long",
      })
    ).toBe("Saturday, March 21, 2026");
  });
});
