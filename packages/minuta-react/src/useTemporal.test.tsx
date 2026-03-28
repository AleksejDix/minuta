import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTemporal, type UseTemporalOptions } from "./useTemporal";
import { createNativeAdapter } from "@allystudio/usetemporal/native";
import type { Adapter } from "@allystudio/usetemporal";

// Helper to suppress console errors and stderr for expected error tests
function suppressErrorOutput<T>(fn: () => T): T {
  // eslint-disable-next-line no-console
  const originalConsoleError = console.error;
  const originalStderrWrite = process.stderr.write;

  // eslint-disable-next-line no-console
  console.error = () => {};
  process.stderr.write = () => true as any;

  try {
    return fn();
  } finally {
    // eslint-disable-next-line no-console
    console.error = originalConsoleError;
    process.stderr.write = originalStderrWrite;
  }
}

describe("useTemporal", () => {
  let mockAdapter: Adapter;
  let testDate: Date;

  beforeEach(() => {
    testDate = new Date(2024, 0, 15, 12, 30, 45); // Jan 15, 2024 12:30:45
    mockAdapter = createNativeAdapter();
  });

  describe("factory function validation", () => {
    it("should throw error when adapter is not provided", () => {
      const options = {
        date: testDate,
      } as UseTemporalOptions;

      suppressErrorOutput(() => {
        expect(() => {
          renderHook(() => useTemporal(options));
        }).toThrow(
          "A date adapter is required. Please install and provide an adapter from @allystudio/usetemporal/* packages."
        );
      });
    });

    it("should throw error when adapter is null", () => {
      const options = {
        date: testDate,
        adapter: null as any,
      };

      suppressErrorOutput(() => {
        expect(() => {
          renderHook(() => useTemporal(options));
        }).toThrow("A date adapter is required");
      });
    });

    it("should throw error when adapter is undefined", () => {
      const options = {
        date: testDate,
        adapter: undefined as any,
      };

      suppressErrorOutput(() => {
        expect(() => {
          renderHook(() => useTemporal(options));
        }).toThrow("A date adapter is required");
      });
    });
  });

  describe("basic initialization", () => {
    it("should create temporal with required options", () => {
      const { result } = renderHook(() =>
        useTemporal({
          date: testDate,
          adapter: mockAdapter,
        })
      );

      expect(result.current).toBeDefined();
      expect(result.current.adapter).toBe(mockAdapter);
      expect(result.current.weekStartsOn).toBe(1); // Default Monday
      expect(result.current.browsing).toBeDefined();
      expect(result.current.now).toBeDefined();
    });

    it("should accept custom weekStartsOn values", () => {
      for (let day = 0; day <= 6; day++) {
        const { result } = renderHook(() =>
          useTemporal({
            date: testDate,
            adapter: mockAdapter,
            weekStartsOn: day,
          })
        );
        expect(result.current.weekStartsOn).toBe(day);
      }
    });

    it("should use provided now date", () => {
      const nowDate = new Date(2024, 0, 20, 10, 0, 0);
      const { result } = renderHook(() =>
        useTemporal({
          date: testDate,
          adapter: mockAdapter,
          now: nowDate,
        })
      );

      expect(result.current.now.date).toEqual(nowDate);
    });

    it("should default now to current date when not provided", () => {
      const beforeCreate = new Date();
      const { result } = renderHook(() =>
        useTemporal({
          date: testDate,
          adapter: mockAdapter,
        })
      );
      const afterCreate = new Date();

      const nowTime = result.current.now.date.getTime();
      expect(nowTime).toBeGreaterThanOrEqual(beforeCreate.getTime());
      expect(nowTime).toBeLessThanOrEqual(afterCreate.getTime());
    });
  });

  describe("browsing period", () => {
    it("should create browsing period with day unit", () => {
      const { result } = renderHook(() =>
        useTemporal({
          date: testDate,
          adapter: mockAdapter,
        })
      );

      expect(result.current.browsing.type).toBe("day");
      expect(result.current.browsing.date).toEqual(testDate);
    });

    it("should create now period with second unit", () => {
      const { result } = renderHook(() =>
        useTemporal({
          date: testDate,
          adapter: mockAdapter,
        })
      );

      expect(result.current.now.type).toBe("second");
    });
  });

  describe("builder methods", () => {
    it("should provide period method", () => {
      const { result } = renderHook(() =>
        useTemporal({
          date: testDate,
          adapter: mockAdapter,
        })
      );

      const year = result.current.period(testDate, "year");
      expect(year.type).toBe("year");
      expect(year.date).toEqual(testDate);
    });

    it("should provide divide method", () => {
      const { result } = renderHook(() =>
        useTemporal({
          date: testDate,
          adapter: mockAdapter,
        })
      );

      const year = result.current.period(testDate, "year");
      const months = result.current.divide(year, "month");

      expect(months).toHaveLength(12);
      expect(months[0].type).toBe("month");
    });

    it("should provide merge method", () => {
      const { result } = renderHook(() =>
        useTemporal({
          date: testDate,
          adapter: mockAdapter,
        })
      );

      const year = result.current.period(testDate, "year");
      const months = result.current.divide(year, "month");
      const merged = result.current.merge(months.slice(0, 3));

      expect(merged).toBeDefined();
      expect(merged?.start).toEqual(months[0].start);
    });

    it("should support custom period creation", () => {
      const { result } = renderHook(() =>
        useTemporal({
          date: testDate,
          adapter: mockAdapter,
        })
      );

      const start = new Date(2024, 0, 1);
      const end = new Date(2024, 0, 31);
      const customPeriod = result.current.period({ start, end });

      expect(customPeriod.start).toEqual(start);
      expect(customPeriod.end).toEqual(end);
      expect(customPeriod.type).toBe("custom");
    });
  });

  describe("navigation methods", () => {
    it("should navigate to next period", () => {
      const { result } = renderHook(() =>
        useTemporal({
          date: testDate,
          adapter: mockAdapter,
        })
      );

      const initialBrowsing = result.current.browsing;

      act(() => {
        result.current.next(result.current.browsing);
      });

      expect(result.current.browsing.date).not.toEqual(initialBrowsing.date);
      expect(result.current.browsing.date.getTime()).toBeGreaterThan(
        initialBrowsing.date.getTime()
      );
    });

    it("should navigate to previous period", () => {
      const { result } = renderHook(() =>
        useTemporal({
          date: testDate,
          adapter: mockAdapter,
        })
      );

      const initialBrowsing = result.current.browsing;

      act(() => {
        result.current.previous(result.current.browsing);
      });

      expect(result.current.browsing.date).not.toEqual(initialBrowsing.date);
      expect(result.current.browsing.date.getTime()).toBeLessThan(
        initialBrowsing.date.getTime()
      );
    });

    it("should navigate with go method", () => {
      const { result } = renderHook(() =>
        useTemporal({
          date: testDate,
          adapter: mockAdapter,
        })
      );

      const initialBrowsing = result.current.browsing;

      act(() => {
        result.current.go(result.current.browsing, 5);
      });

      expect(result.current.browsing.date).not.toEqual(initialBrowsing.date);
    });

    it("should navigate multiple periods with next count", () => {
      const { result } = renderHook(() =>
        useTemporal({
          date: testDate,
          adapter: mockAdapter,
        })
      );

      const initialBrowsing = result.current.browsing;

      act(() => {
        result.current.next(result.current.browsing, 3);
      });

      expect(result.current.browsing.date).not.toEqual(initialBrowsing.date);
    });

    it("should navigate multiple periods with previous count", () => {
      const { result } = renderHook(() =>
        useTemporal({
          date: testDate,
          adapter: mockAdapter,
        })
      );

      const initialBrowsing = result.current.browsing;

      act(() => {
        result.current.previous(result.current.browsing, 2);
      });

      expect(result.current.browsing.date).not.toEqual(initialBrowsing.date);
    });

    it("should update browsing when navigating non-browsing period", () => {
      const { result } = renderHook(() =>
        useTemporal({
          date: testDate,
          adapter: mockAdapter,
        })
      );

      const otherPeriod = result.current.period(new Date(2025, 0, 1), "month");
      const initialBrowsing = result.current.browsing;

      act(() => {
        result.current.next(otherPeriod);
      });

      expect(result.current.browsing).not.toEqual(initialBrowsing);
      expect(result.current.browsing.date.getMonth()).toBe(1);
      expect(result.current.browsing.date.getFullYear()).toBe(2025);
    });
  });

  describe("utility methods", () => {
    it("should provide split method", () => {
      const { result } = renderHook(() =>
        useTemporal({
          date: testDate,
          adapter: mockAdapter,
        })
      );

      const year = result.current.period(testDate, "year");
      const splitDate = new Date(2024, 5, 1); // June 1st
      const [before, after] = result.current.split(year, splitDate);

      // Before period should end at or just before split date
      expect(before.end.getTime()).toBeLessThanOrEqual(splitDate.getTime());
      // After period should start at split date
      expect(after.start).toEqual(splitDate);
      // Verify they cover the full year
      expect(before.start).toEqual(year.start);
      expect(after.end).toEqual(year.end);
    });

    it("should provide contains method", () => {
      const { result } = renderHook(() =>
        useTemporal({
          date: testDate,
          adapter: mockAdapter,
        })
      );

      const month = result.current.period(testDate, "month");
      const dateInMonth = new Date(2024, 0, 20);
      const dateOutsideMonth = new Date(2024, 1, 1);

      expect(result.current.contains(month, dateInMonth)).toBe(true);
      expect(result.current.contains(month, dateOutsideMonth)).toBe(false);
    });

    it("should provide isSame method", () => {
      const { result } = renderHook(() =>
        useTemporal({
          date: testDate,
          adapter: mockAdapter,
        })
      );

      const date1 = new Date(2024, 0, 15, 10, 0, 0);
      const date2 = new Date(2024, 0, 15, 14, 0, 0);
      const period1 = result.current.period(date1, "day");
      const period2 = result.current.period(date2, "day");

      expect(result.current.isSame(period1, period2, "day")).toBe(true);
      expect(result.current.isSame(period1, period2, "hour")).toBe(false);
    });
  });

  describe("adapter memoization", () => {
    it("should update browsing when adapter changes", () => {
      const { result, rerender } = renderHook(
        ({ adapter }) =>
          useTemporal({
            date: testDate,
            adapter,
          }),
        {
          initialProps: { adapter: mockAdapter },
        }
      );

      const initialBrowsing = result.current.browsing;
      const newAdapter = createNativeAdapter();

      rerender({ adapter: newAdapter });

      // Browsing should be recreated with new adapter
      expect(result.current.adapter).toBe(newAdapter);
      expect(result.current.browsing).not.toBe(initialBrowsing);
    });
  });
});
