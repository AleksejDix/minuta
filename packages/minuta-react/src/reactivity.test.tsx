import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTemporal } from "./useTemporal";
import { usePeriod } from "./usePeriod";
import { createNativeAdapter } from "@allystudio/usetemporal/native";
import type { Adapter } from "@allystudio/usetemporal";

describe("React reactivity", () => {
  let mockAdapter: Adapter;
  let testDate: Date;

  beforeEach(() => {
    testDate = new Date(2024, 0, 15, 12, 30, 45); // Jan 15, 2024 12:30:45
    mockAdapter = createNativeAdapter();
  });

  describe("usePeriod reactivity", () => {
    it("should create period from temporal browsing", () => {
      const { result: temporalResult } = renderHook(() =>
        useTemporal({
          date: testDate,
          adapter: mockAdapter,
        })
      );

      const { result: periodResult } = renderHook(() =>
        usePeriod(temporalResult.current, "month")
      );

      expect(periodResult.current.type).toBe("month");
      expect(periodResult.current.date).toEqual(testDate);
    });

    it("should update period when browsing changes", () => {
      const { result: temporalResult } = renderHook(() =>
        useTemporal({
          date: testDate,
          adapter: mockAdapter,
        })
      );

      const { result: periodResult, rerender } = renderHook(() =>
        usePeriod(temporalResult.current, "year")
      );

      const initialYear = periodResult.current;

      act(() => {
        temporalResult.current.next(temporalResult.current.browsing);
      });

      rerender();

      expect(periodResult.current).not.toBe(initialYear);
      expect(periodResult.current.date).not.toEqual(initialYear.date);
    });

    it("should handle multiple periods from same temporal", () => {
      const { result: temporalResult } = renderHook(() =>
        useTemporal({
          date: testDate,
          adapter: mockAdapter,
        })
      );

      const { result: yearResult } = renderHook(() =>
        usePeriod(temporalResult.current, "year")
      );

      const { result: monthResult } = renderHook(() =>
        usePeriod(temporalResult.current, "month")
      );

      expect(yearResult.current.type).toBe("year");
      expect(monthResult.current.type).toBe("month");
      expect(yearResult.current.date).toEqual(monthResult.current.date);
    });

    it("should memoize period when dependencies unchanged", () => {
      const { result: temporalResult } = renderHook(() =>
        useTemporal({
          date: testDate,
          adapter: mockAdapter,
        })
      );

      const { result: periodResult, rerender } = renderHook(() =>
        usePeriod(temporalResult.current, "month")
      );

      const firstRender = periodResult.current;
      rerender();
      const secondRender = periodResult.current;

      // Should return same object if dependencies haven't changed
      expect(firstRender).toBe(secondRender);
    });
  });

  describe("navigation reactivity", () => {
    it("should update periods when navigating derived period", () => {
      const { result: temporalResult } = renderHook(() =>
        useTemporal({
          date: testDate,
          adapter: mockAdapter,
        })
      );

      const { result: monthResult, rerender } = renderHook(() =>
        usePeriod(temporalResult.current, "month")
      );

      const januaryMonth = monthResult.current;

      act(() => {
        temporalResult.current.next(monthResult.current);
      });

      rerender();

      const februaryMonth = monthResult.current;
      expect(februaryMonth).not.toBe(januaryMonth);
      expect(februaryMonth.date.getMonth()).toBe(1);
    });

    it("should trigger period update on next navigation", () => {
      const { result: temporalResult } = renderHook(() =>
        useTemporal({
          date: testDate,
          adapter: mockAdapter,
        })
      );

      const { result: monthResult, rerender } = renderHook(() =>
        usePeriod(temporalResult.current, "month")
      );

      const januaryMonth = monthResult.current;
      expect(januaryMonth.date.getMonth()).toBe(0); // January

      act(() => {
        // Navigate browsing forward by 31 days to get to February
        temporalResult.current.go(temporalResult.current.browsing, 31);
      });

      rerender();

      const februaryMonth = monthResult.current;
      expect(februaryMonth.date.getMonth()).toBe(1); // February
    });

    it("should trigger period update on previous navigation", () => {
      const { result: temporalResult } = renderHook(() =>
        useTemporal({
          date: testDate,
          adapter: mockAdapter,
        })
      );

      const { result: monthResult, rerender } = renderHook(() =>
        usePeriod(temporalResult.current, "month")
      );

      act(() => {
        // Navigate browsing back by 31 days to get to December 2023
        temporalResult.current.go(temporalResult.current.browsing, -31);
      });

      rerender();

      const decemberMonth = monthResult.current;
      expect(decemberMonth.date.getMonth()).toBe(11); // December
      expect(decemberMonth.date.getFullYear()).toBe(2023);
    });

    it("should trigger period update on go navigation", () => {
      const { result: temporalResult } = renderHook(() =>
        useTemporal({
          date: testDate,
          adapter: mockAdapter,
        })
      );

      const { result: yearResult, rerender } = renderHook(() =>
        usePeriod(temporalResult.current, "year")
      );

      const year2024 = yearResult.current;

      act(() => {
        temporalResult.current.go(temporalResult.current.browsing, 5);
      });

      rerender();

      const year2024Later = yearResult.current;
      expect(year2024Later.date).not.toEqual(year2024.date);
    });
  });

  describe("adapter reactivity", () => {
    it("should update periods when adapter changes", () => {
      const { result: temporalResult, rerender: rerenderTemporal } = renderHook(
        ({ adapter }) =>
          useTemporal({
            date: testDate,
            adapter,
          }),
        {
          initialProps: { adapter: mockAdapter },
        }
      );

      const { result: monthResult, rerender: rerenderMonth } = renderHook(() =>
        usePeriod(temporalResult.current, "month")
      );

      const initialMonth = monthResult.current;
      const newAdapter = createNativeAdapter();

      rerenderTemporal({ adapter: newAdapter });
      rerenderMonth();

      expect(monthResult.current).not.toBe(initialMonth);
    });
  });

  describe("divide operation reactivity", () => {
    it("should divide periods that update with browsing", () => {
      const { result: temporalResult } = renderHook(() =>
        useTemporal({
          date: testDate,
          adapter: mockAdapter,
        })
      );

      const { result: monthResult, rerender } = renderHook(() =>
        usePeriod(temporalResult.current, "month")
      );

      const januaryWeeks = temporalResult.current.divide(
        monthResult.current,
        "week"
      );
      expect(januaryWeeks.length).toBeGreaterThan(0);

      act(() => {
        // Navigate browsing forward by 31 days to get to February
        temporalResult.current.go(temporalResult.current.browsing, 31);
      });

      rerender();

      const februaryWeeks = temporalResult.current.divide(
        monthResult.current,
        "week"
      );
      expect(februaryWeeks.length).toBeGreaterThan(0);
      expect(februaryWeeks[0].date).not.toEqual(januaryWeeks[0].date);
    });
  });

  describe("integration with multiple hooks", () => {
    it("should coordinate multiple usePeriod hooks", () => {
      const { result: temporalResult } = renderHook(() =>
        useTemporal({
          date: testDate,
          adapter: mockAdapter,
        })
      );

      const { result: yearResult, rerender: rerenderYear } = renderHook(() =>
        usePeriod(temporalResult.current, "year")
      );

      const { result: monthResult, rerender: rerenderMonth } = renderHook(() =>
        usePeriod(temporalResult.current, "month")
      );

      const { result: weekResult, rerender: rerenderWeek } = renderHook(() =>
        usePeriod(temporalResult.current, "week")
      );

      const initialYear = yearResult.current;
      const initialMonth = monthResult.current;
      const initialWeek = weekResult.current;

      act(() => {
        temporalResult.current.go(temporalResult.current.browsing, 30);
      });

      rerenderYear();
      rerenderMonth();
      rerenderWeek();

      expect(yearResult.current).not.toBe(initialYear);
      expect(monthResult.current).not.toBe(initialMonth);
      expect(weekResult.current).not.toBe(initialWeek);
    });
  });
});
