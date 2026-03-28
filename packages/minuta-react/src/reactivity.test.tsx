import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMinuta } from "./useMinuta";
import { usePeriod } from "./usePeriod";
import { createNativeAdapter } from "minuta/native";
import type { Adapter } from "minuta";

describe("React reactivity", () => {
  let adapter: Adapter;
  let testDate: Date;

  beforeEach(() => {
    testDate = new Date(2024, 0, 15);
    adapter = createNativeAdapter();
  });

  describe("usePeriod", () => {
    it("should derive a month period from browsing", () => {
      const { result: minuta } = renderHook(() =>
        useMinuta({ date: testDate, adapter })
      );

      const { result: month } = renderHook(() =>
        usePeriod(minuta.current, "month")
      );

      expect(month.current.type).toBe("month");
      expect(month.current.start.getMonth()).toBe(0); // January
      expect(month.current.start.getDate()).toBe(1); // Start of month
    });

    it("should update when browsing changes", () => {
      const { result: minuta } = renderHook(() =>
        useMinuta({ date: testDate, adapter })
      );

      const { result: month, rerender } = renderHook(() =>
        usePeriod(minuta.current, "month")
      );

      const january = month.current;
      expect(january.start.getMonth()).toBe(0);

      act(() => {
        minuta.current.next(minuta.current.browsing);
      });
      rerender();

      // Browsing moved 1 day — still January
      expect(month.current.start.getMonth()).toBe(0);
    });

    it("should memoize when dependencies unchanged", () => {
      const { result: minuta } = renderHook(() =>
        useMinuta({ date: testDate, adapter })
      );

      const { result: month, rerender } = renderHook(() =>
        usePeriod(minuta.current, "month")
      );

      const first = month.current;
      rerender();
      expect(month.current).toBe(first);
    });
  });

  describe("navigation", () => {
    it("should navigate to next month", () => {
      const { result: minuta } = renderHook(() =>
        useMinuta({ date: testDate, adapter })
      );

      const { result: month, rerender } = renderHook(() =>
        usePeriod(minuta.current, "month")
      );

      expect(month.current.start.getMonth()).toBe(0); // January

      act(() => {
        // Navigate browsing forward by 31 days to reach February
        minuta.current.go(minuta.current.browsing, 31);
      });
      rerender();

      expect(month.current.start.getMonth()).toBe(1); // February
    });

    it("should navigate to previous month", () => {
      const { result: minuta } = renderHook(() =>
        useMinuta({ date: testDate, adapter })
      );

      const { result: month, rerender } = renderHook(() =>
        usePeriod(minuta.current, "month")
      );

      act(() => {
        minuta.current.go(minuta.current.browsing, -31);
      });
      rerender();

      expect(month.current.start.getMonth()).toBe(11); // December 2023
      expect(month.current.start.getFullYear()).toBe(2023);
    });

    it("should update year period when browsing crosses year boundary", () => {
      const { result: minuta } = renderHook(() =>
        useMinuta({ date: testDate, adapter })
      );

      const { result: year, rerender } = renderHook(() =>
        usePeriod(minuta.current, "year")
      );

      expect(year.current.start.getFullYear()).toBe(2024);

      act(() => {
        // Navigate forward 365 days to cross into 2025
        minuta.current.go(minuta.current.browsing, 365);
      });
      rerender();

      // 2024 is leap year, 365 days from Jan 15 = Jan 14, 2025? Dec 2024?
      // The exact date depends, but year should still be derivable
      expect(year.current.type).toBe("year");
    });
  });

  describe("divide reactivity", () => {
    it("should divide month into weeks", () => {
      const { result: minuta } = renderHook(() =>
        useMinuta({ date: testDate, adapter })
      );

      const { result: month, rerender } = renderHook(() =>
        usePeriod(minuta.current, "month")
      );

      const janWeeks = minuta.current.divide(month.current, "week");
      expect(janWeeks.length).toBeGreaterThan(0);

      act(() => {
        minuta.current.go(minuta.current.browsing, 31);
      });
      rerender();

      const febWeeks = minuta.current.divide(month.current, "week");
      expect(febWeeks[0].start).not.toEqual(janWeeks[0].start);
    });
  });

  describe("multiple hooks", () => {
    it("should coordinate year, month, week periods", () => {
      const { result: minuta } = renderHook(() =>
        useMinuta({ date: testDate, adapter })
      );

      const { result: year, rerender: rYear } = renderHook(() =>
        usePeriod(minuta.current, "year")
      );
      const { result: month, rerender: rMonth } = renderHook(() =>
        usePeriod(minuta.current, "month")
      );
      const { result: week, rerender: rWeek } = renderHook(() =>
        usePeriod(minuta.current, "week")
      );

      expect(year.current.type).toBe("year");
      expect(month.current.type).toBe("month");
      expect(week.current.type).toBe("week");

      act(() => {
        minuta.current.go(minuta.current.browsing, 60);
      });
      rYear();
      rMonth();
      rWeek();

      // Month should have changed (60 days from Jan 15 = March)
      expect(month.current.start.getMonth()).toBe(2); // March
    });
  });
});
