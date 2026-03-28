import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMinuta, type UseMinutaOptions } from "./useMinuta";
import { createNativeAdapter } from "minuta/native";
import type { Adapter } from "minuta";

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

describe("useMinuta", () => {
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
      } as UseMinutaOptions;

      suppressErrorOutput(() => {
        expect(() => {
          renderHook(() => useMinuta(options));
        }).toThrow(
          "A date adapter is required. Please install and provide an adapter from minuta/* packages."
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
          renderHook(() => useMinuta(options));
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
          renderHook(() => useMinuta(options));
        }).toThrow("A date adapter is required");
      });
    });
  });

  describe("basic initialization", () => {
    it("should create temporal with required options", () => {
      const { result } = renderHook(() =>
        useMinuta({
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
          useMinuta({
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
        useMinuta({
          date: testDate,
          adapter: mockAdapter,
          now: nowDate,
        })
      );

      expect(result.current.now.start.getSeconds()).toBe(nowDate.getSeconds());
    });

    it("should default now to current date when not provided", () => {
      const beforeCreate = new Date();
      const { result } = renderHook(() =>
        useMinuta({
          date: testDate,
          adapter: mockAdapter,
        })
      );
      const afterCreate = new Date();

      const nowTime = result.current.now.start.getTime();
      // now.start is startOf(now, "second") — truncated to second boundary
      expect(nowTime).toBeGreaterThanOrEqual(beforeCreate.getTime() - 1000);
      expect(nowTime).toBeLessThanOrEqual(afterCreate.getTime());
    });
  });

  describe("browsing period", () => {
    it("should create browsing period with day unit", () => {
      const { result } = renderHook(() =>
        useMinuta({
          date: testDate,
          adapter: mockAdapter,
        })
      );

      expect(result.current.browsing.type).toBe("day");
      expect(result.current.browsing.start.getDate()).toBe(testDate.getDate());
    });

    it("should create now period with second unit", () => {
      const { result } = renderHook(() =>
        useMinuta({
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
        useMinuta({
          date: testDate,
          adapter: mockAdapter,
        })
      );

      const year = result.current.derivePeriod(testDate, "year");
      expect(year.type).toBe("year");
      expect(year.start.getFullYear()).toBe(2024);
    });

    it("should provide divide method", () => {
      const { result } = renderHook(() =>
        useMinuta({
          date: testDate,
          adapter: mockAdapter,
        })
      );

      const year = result.current.derivePeriod(testDate, "year");
      const months = result.current.divide(year, "month");

      expect(months).toHaveLength(12);
      expect(months[0].type).toBe("month");
    });

    it("should provide merge method", () => {
      const { result } = renderHook(() =>
        useMinuta({
          date: testDate,
          adapter: mockAdapter,
        })
      );

      const year = result.current.derivePeriod(testDate, "year");
      const months = result.current.divide(year, "month");
      const merged = result.current.merge(months.slice(0, 3));

      expect(merged).toBeDefined();
      expect(merged?.start).toEqual(months[0].start);
    });

    it("should support custom period creation", () => {
      const { result } = renderHook(() =>
        useMinuta({
          date: testDate,
          adapter: mockAdapter,
        })
      );

      const start = new Date(2024, 0, 1);
      const end = new Date(2024, 0, 31);
      const customPeriod = result.current.createPeriod(start, end);

      expect(customPeriod.start).toEqual(start);
      expect(customPeriod.end).toEqual(end);
      expect(customPeriod.type).toBe("custom");
    });
  });

  describe("navigation methods", () => {
    it("should navigate to next period", () => {
      const { result } = renderHook(() =>
        useMinuta({
          date: testDate,
          adapter: mockAdapter,
        })
      );

      const initialBrowsing = result.current.browsing;

      act(() => {
        result.current.next(result.current.browsing);
      });

      expect(result.current.browsing.start).not.toEqual(initialBrowsing.start);
      expect(result.current.browsing.start.getTime()).toBeGreaterThan(
        initialBrowsing.start.getTime()
      );
    });

    it("should navigate to previous period", () => {
      const { result } = renderHook(() =>
        useMinuta({
          date: testDate,
          adapter: mockAdapter,
        })
      );

      const initialBrowsing = result.current.browsing;

      act(() => {
        result.current.previous(result.current.browsing);
      });

      expect(result.current.browsing.start).not.toEqual(initialBrowsing.start);
      expect(result.current.browsing.start.getTime()).toBeLessThan(
        initialBrowsing.start.getTime()
      );
    });

    it("should navigate with go method", () => {
      const { result } = renderHook(() =>
        useMinuta({
          date: testDate,
          adapter: mockAdapter,
        })
      );

      const initialBrowsing = result.current.browsing;

      act(() => {
        result.current.go(result.current.browsing, 5);
      });

      expect(result.current.browsing.start).not.toEqual(initialBrowsing.start);
    });

    it("should navigate multiple periods with next count", () => {
      const { result } = renderHook(() =>
        useMinuta({
          date: testDate,
          adapter: mockAdapter,
        })
      );

      const initialBrowsing = result.current.browsing;

      act(() => {
        result.current.next(result.current.browsing, 3);
      });

      expect(result.current.browsing.start).not.toEqual(initialBrowsing.start);
    });

    it("should navigate multiple periods with previous count", () => {
      const { result } = renderHook(() =>
        useMinuta({
          date: testDate,
          adapter: mockAdapter,
        })
      );

      const initialBrowsing = result.current.browsing;

      act(() => {
        result.current.previous(result.current.browsing, 2);
      });

      expect(result.current.browsing.start).not.toEqual(initialBrowsing.start);
    });

    it("should update browsing when navigating non-browsing period", () => {
      const { result } = renderHook(() =>
        useMinuta({
          date: testDate,
          adapter: mockAdapter,
        })
      );

      const otherPeriod = result.current.derivePeriod(
        new Date(2025, 0, 1),
        "month"
      );
      const initialBrowsing = result.current.browsing;

      act(() => {
        result.current.next(otherPeriod);
      });

      expect(result.current.browsing).not.toEqual(initialBrowsing);
      expect(result.current.browsing.start.getMonth()).toBe(1);
      expect(result.current.browsing.start.getFullYear()).toBe(2025);
    });
  });

  describe("utility methods", () => {
    it("should provide split method", () => {
      const { result } = renderHook(() =>
        useMinuta({
          date: testDate,
          adapter: mockAdapter,
        })
      );

      const year = result.current.derivePeriod(testDate, "year");
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
        useMinuta({
          date: testDate,
          adapter: mockAdapter,
        })
      );

      const month = result.current.derivePeriod(testDate, "month");
      const dateInMonth = new Date(2024, 0, 20);
      const dateOutsideMonth = new Date(2024, 1, 1);

      expect(result.current.contains(month, dateInMonth)).toBe(true);
      expect(result.current.contains(month, dateOutsideMonth)).toBe(false);
    });

    it("should provide isSame method", () => {
      const { result } = renderHook(() =>
        useMinuta({
          date: testDate,
          adapter: mockAdapter,
        })
      );

      const janDay = result.current.derivePeriod(new Date(2024, 0, 15), "day");
      const febDay = result.current.derivePeriod(new Date(2024, 1, 15), "day");

      expect(result.current.isSame(janDay, janDay, "month")).toBe(true);
      expect(result.current.isSame(janDay, febDay, "month")).toBe(false);
    });
  });

  describe("adapter memoization", () => {
    it("should update browsing when adapter changes", () => {
      const { result, rerender } = renderHook(
        ({ adapter }) =>
          useMinuta({
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
