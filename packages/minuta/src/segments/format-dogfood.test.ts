import { describe, it, expect } from "vitest";
import { createNativeAdapter } from "../adapters/native/adapter";
import {
  derivePeriod,
  createPeriod,
  go,
  next,
  previous,
  divide,
  merge,
  split,
  contains,
  isSame,
  clamp,
  snap,
  move,
  gap,
} from "..";
import { format, formatAsRange } from "../test/format";

const adapter = createNativeAdapter();
const p = (date: Date, unit: Parameters<typeof derivePeriod>[2]) =>
  derivePeriod(adapter, date, unit);

describe("dogfood: all operations with formatPeriod assertions", () => {
  // ── go ──

  describe("go", () => {
    it("forward 2 months from June", () => {
      expect(format(go(adapter, p(new Date(2024, 5, 15), "month"), 2))).toBe(
        "August 2024"
      );
    });

    it("backward across year boundary", () => {
      expect(format(go(adapter, p(new Date(2024, 1, 15), "month"), -3))).toBe(
        "November 2023"
      );
    });

    it("forward 1 day from Jan 31", () => {
      expect(format(go(adapter, p(new Date(2024, 0, 31), "day"), 1))).toBe(
        "February 1, 2024"
      );
    });

    it("forward 1 year", () => {
      expect(format(go(adapter, p(new Date(2024, 5, 15), "year"), 1))).toBe(
        "2025"
      );
    });
  });

  // ── next / previous ──

  describe("next", () => {
    it("next month from December crosses year", () => {
      expect(format(next(adapter, p(new Date(2024, 11, 15), "month")))).toBe(
        "January 2025"
      );
    });

    it("next day from Feb 28 in leap year", () => {
      expect(format(next(adapter, p(new Date(2024, 1, 28), "day")))).toBe(
        "February 29, 2024"
      );
    });

    it("next day from Feb 28 in non-leap year", () => {
      expect(format(next(adapter, p(new Date(2025, 1, 28), "day")))).toBe(
        "March 1, 2025"
      );
    });
  });

  describe("previous", () => {
    it("previous month from January crosses year", () => {
      expect(format(previous(adapter, p(new Date(2024, 0, 15), "month")))).toBe(
        "December 2023"
      );
    });

    it("previous day from March 1", () => {
      expect(format(previous(adapter, p(new Date(2024, 2, 1), "day")))).toBe(
        "February 29, 2024"
      );
    });
  });

  // ── divide ──

  describe("divide", () => {
    it("Q1 into months", () => {
      const q1 = p(new Date(2024, 0, 15), "quarter");
      expect(
        divide(adapter, q1, "month").map((period) => format(period))
      ).toEqual(["January 2024", "February 2024", "March 2024"]);
    });

    it("year into quarters (by month count)", () => {
      const year = p(new Date(2024, 0, 1), "year");
      const quarters = divide(adapter, year, "quarter");
      expect(quarters.length).toBe(4);
      expect(format(quarters[0])).toContain("Jan");
      expect(format(quarters[0])).toContain("2024");
      expect(format(quarters[3])).toContain("Oct");
      expect(format(quarters[3])).toContain("2024");
    });

    it("month into weeks", () => {
      const march = p(new Date(2026, 2, 1), "month");
      const weeks = divide(adapter, march, "week");
      expect(weeks.length).toBeGreaterThanOrEqual(4);
      expect(weeks.length).toBeLessThanOrEqual(6);
    });

    it("week into days", () => {
      const week = p(new Date(2026, 2, 11), "week");
      const days = divide(adapter, week, "day");
      expect(days.length).toBe(7);
    });
  });

  // ── merge ──

  describe("merge", () => {
    it("merges 3 consecutive months into a quarter", () => {
      const jan = p(new Date(2024, 0, 1), "month");
      const feb = p(new Date(2024, 1, 1), "month");
      const mar = p(new Date(2024, 2, 1), "month");
      const merged = merge([jan, feb, mar], "quarter");
      expect(formatAsRange(merged)).toContain("Jan");
      expect(formatAsRange(merged)).toContain("Mar");
      expect(formatAsRange(merged)).toContain("2024");
    });
  });

  // ── split ──

  describe("split", () => {
    it("splits March at the 15th", () => {
      const march = p(new Date(2026, 2, 1), "month");
      const [first, second] = split(march, new Date(2026, 2, 15));
      expect(formatAsRange(first)).toContain("Mar");
      expect(formatAsRange(second)).toContain("Mar");
    });
  });

  // ── contains ──

  describe("contains", () => {
    it("March contains March 15", () => {
      const march = p(new Date(2026, 2, 1), "month");
      expect(contains(march, new Date(2026, 2, 15))).toBe(true);
    });

    it("March does not contain April 1", () => {
      const march = p(new Date(2026, 2, 1), "month");
      expect(contains(march, new Date(2026, 3, 1))).toBe(false);
    });

    it("Q1 contains February", () => {
      const q1 = p(new Date(2024, 0, 1), "quarter");
      const feb = p(new Date(2024, 1, 1), "month");
      expect(contains(q1, feb)).toBe(true);
    });
  });

  // ── isSame ──

  describe("isSame", () => {
    it("two days in same month", () => {
      const day1 = p(new Date(2024, 2, 5), "day");
      const day2 = p(new Date(2024, 2, 20), "day");
      expect(isSame(adapter, day1, day2, "month")).toBe(true);
    });

    it("two days in different months", () => {
      const day1 = p(new Date(2024, 2, 31), "day");
      const day2 = p(new Date(2024, 3, 1), "day");
      expect(isSame(adapter, day1, day2, "month")).toBe(false);
    });
  });

  // ── clamp ──

  describe("clamp", () => {
    it("clamps a wide period to bounds", () => {
      const wide = createPeriod(new Date(2024, 0, 1), new Date(2024, 11, 31));
      const bounds = createPeriod(new Date(2024, 2, 1), new Date(2024, 5, 30));
      const result = clamp(wide, bounds)!;
      expect(formatAsRange(result)).toContain("Mar");
      expect(formatAsRange(result)).toContain("Jun");
    });
  });

  // ── snap ──

  describe("snap", () => {
    it("snaps a date to nearest 15-minute interval", () => {
      const date = new Date(2024, 2, 15, 10, 38);
      const snapped = snap(date, 15 * 60000);
      // Should round to nearest 15-min boundary
      expect(snapped.getMinutes() % 15).toBe(0);
    });

    it("floor snaps to earlier boundary", () => {
      const date = new Date(2024, 2, 15, 10, 37);
      const snapped = snap(date, 15 * 60000, "floor");
      expect(snapped.getTime()).toBeLessThanOrEqual(date.getTime());
    });

    it("ceil snaps to later boundary", () => {
      const date = new Date(2024, 2, 15, 10, 37);
      const snapped = snap(date, 15 * 60000, "ceil");
      expect(snapped.getTime()).toBeGreaterThanOrEqual(date.getTime());
    });
  });

  // ── move ──

  describe("move", () => {
    it("moves a period to a new anchor date", () => {
      const week = createPeriod(new Date(2024, 0, 1), new Date(2024, 0, 7));
      const moved = move(week, new Date(2024, 5, 1));
      expect(formatAsRange(moved)).toContain("Jun");
    });
  });

  // ── gap ──

  describe("gap", () => {
    it("finds gap between two periods", () => {
      const jan = p(new Date(2024, 0, 1), "month");
      const mar = p(new Date(2024, 2, 1), "month");
      const g = gap(jan, mar);
      expect(g).not.toBeUndefined();
      expect(formatAsRange(g!)).toContain("Feb");
    });

    it("returns zero-duration for adjacent periods", () => {
      const jan = p(new Date(2024, 0, 1), "month");
      const feb = p(new Date(2024, 1, 1), "month");
      const g = gap(jan, feb);
      // Adjacent months: gap is zero-duration (start === end)
      expect(g.start.getTime()).toBe(g.end.getTime());
    });
  });
});
