import { date, zoned } from "#src/test/temporal";
import { describe, expect, it } from "vitest";
import { formatPeriod, formatRange } from "./format";
import { periodWith, range } from "#src/operations/period";
import type { DateUnit } from "#src/types";
import { createUnits } from "#src/create-units";

// A zone far from UTC: a date that shifted with the zone would show it
const units = createUnits({ timeZone: "Pacific/Kiritimati" });

// Intl's thin and narrow no-break spaces as plain spaces, for readable assertions
function plain(written: string): string {
  return written.replaceAll(/[\u2009\u202F]/gu, " ");
}

function periodOf(
  value: string,
  unit: DateUnit
): ReturnType<typeof periodWith<DateUnit>> {
  return periodWith(units, date(value), unit);
}

describe("formatPeriod(): dates", () => {
  it.each([
    { expected: "15. März 2026", locale: "de-CH", unit: "day" },
    { expected: "March 15, 2026", locale: "en-US", unit: "day" },
    { expected: "März 2026", locale: "de-CH", unit: "month" },
    { expected: "March 2026", locale: "en-US", unit: "month" },
    { expected: "2026", locale: "en-US", unit: "year" },
  ] as const)(
    "a $unit in $locale: $expected",
    { timeout: 5000 },
    ({ expected, locale, unit }) => {
      expect.hasAssertions();
      const period = periodOf("2026-03-15", unit);
      expect(plain(formatPeriod(period, locale))).toBe(expected);
    }
  );

  it("writes a week as the range of its days", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const week = periodOf("2026-03-11", "week");
    expect(plain(formatPeriod(week, "en-US"))).toBe("Mar 9 – 15, 2026");
  });
});

describe("formatPeriod(): weekdays and zones", () => {
  it(
    "writes only the weekday when asked for it alone",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const sunday = periodOf("2026-03-15", "day");
      expect(plain(formatPeriod(sunday, "en-US", { weekday: "short" }))).toBe(
        "Sun"
      );
      expect(plain(formatPeriod(sunday, "de-CH", { weekday: "long" }))).toBe(
        "Sonntag"
      );
    }
  );

  it(
    "keeps a date's day whatever time zone is asked for",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const day = periodOf("2026-03-15", "day");
      expect(
        plain(formatPeriod(day, "en-US", { timeZone: "Pacific/Pago_Pago" }))
      ).toBe("March 15, 2026");
    }
  );
});

describe("formatRange()", () => {
  it.each([
    {
      expected: "1.–31. März 2026",
      from: "2026-03-01",
      locale: "de-CH",
      to: "2026-04-01",
    },
    {
      expected: "30. März – 5. Apr. 2026",
      from: "2026-03-30",
      locale: "de-CH",
      to: "2026-04-06",
    },
    {
      expected: "Dec 29, 2025 – Jan 4, 2026",
      from: "2025-12-29",
      locale: "en-US",
      to: "2026-01-05",
    },
  ] as const)(
    "$from to $to in $locale: $expected",
    { timeout: 5000 },
    ({ expected, from, locale, to }) => {
      expect.hasAssertions();
      const span = range(date(from), date(to));
      expect(plain(formatRange(span, locale))).toBe(expected);
    }
  );
});

describe("formatRange(): moments", () => {
  it(
    "writes a time period to its real end, in its own zone",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const hour = periodWith(
        units,
        zoned("2026-03-18T10:00[Europe/Zurich]"),
        "hour"
      );
      expect(plain(formatRange(hour, "en-US", { hourCycle: "h23" }))).toBe(
        "Mar 18, 10:00 – 11:00"
      );
    }
  );

  it("writes a moment in another zone when asked", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const hour = periodWith(
      units,
      zoned("2026-03-18T10:00[Europe/Zurich]"),
      "hour"
    );
    expect(
      plain(
        formatPeriod(hour, "en-US", {
          hourCycle: "h23",
          timeZone: "Asia/Tokyo",
        })
      )
    ).toBe("Mar 18, 18:00");
  });
});
