import { describe, expect, it, vi } from "vitest";
import type { Adapter } from "minuta";
import { createMinuta } from "./create-minuta";
import { createNativeAdapter } from "minuta/native";
import { ref } from "vue";

const SUNDAY = 0;
const MONDAY = 1;
const INVALID_WEEK_START = -1;
const ITERATIONS = 100;
const MAX_DURATION_MS = 100;

const mockAdapter = createNativeAdapter();
const testDate = new Date("2024-01-15T12:30:45");

describe("createMinuta() edge cases", () => {
  it("should handle dates at year boundaries", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const endOfYear = new Date("2023-12-31T23:59:59");
    const minuta = createMinuta({
      adapter: mockAdapter,
      date: ref(endOfYear),
    });

    expect(minuta.browsing.value.start).toStrictEqual(endOfYear);
  });

  it("should handle leap year dates", { timeout: 5000 }, () => {
    expect.hasAssertions();
    // Feb 29, 2024
    const leapDay = new Date("2024-02-29T00:00:00");
    const minuta = createMinuta({
      adapter: mockAdapter,
      date: ref(leapDay),
    });

    expect(minuta.browsing.value.start).toStrictEqual(leapDay);
  });

  it("should handle invalid weekStartsOn gracefully", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const minuta = createMinuta({
      adapter: mockAdapter,
      date: ref(testDate),
      weekStartsOn: INVALID_WEEK_START,
    });

    // Uses provided value
    expect(minuta.weekStartsOn).toBe(INVALID_WEEK_START);
  });
});

describe("createMinuta() adapter references", () => {
  it(
    "should work with different adapter implementations",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      // Mock a custom adapter
      const customAdapter: Adapter = {
        add: vi.fn<Adapter["add"]>(),
        diff: vi.fn<Adapter["diff"]>(),
        endOf: vi.fn<Adapter["endOf"]>(),
        startOf: vi.fn<Adapter["startOf"]>(),
      };

      const minuta = createMinuta({
        adapter: customAdapter,
        date: ref(testDate),
      });

      expect(minuta.adapter).toBe(customAdapter);
    }
  );

  it("should preserve adapter reference", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const minuta = createMinuta({
      adapter: mockAdapter,
      date: ref(testDate),
    });

    expect(minuta.adapter).toBe(mockAdapter);
    expect(minuta.adapter.startOf).toBe(mockAdapter.startOf);
  });
});

describe("createMinuta() adapter switching", () => {
  it(
    "should recompute week periods when adapter weekStartsOn changes",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      // Wednesday
      const date = new Date("2024-01-03T12:00:00");
      const minuta = createMinuta({
        adapter: createNativeAdapter({ weekStartsOn: MONDAY }),
        date: ref(date),
      });

      const mondayWeek = minuta.derivePeriod(date, "week");
      expect({
        date: mondayWeek.start.getDate(),
        day: mondayWeek.start.getDay(),
      }).toStrictEqual({ date: 1, day: 1 });

      minuta.adapter = createNativeAdapter({ weekStartsOn: SUNDAY });

      // Dec 31, 2023
      const sundayWeek = minuta.derivePeriod(date, "week");
      expect({
        date: sundayWeek.start.getDate(),
        day: sundayWeek.start.getDay(),
        month: sundayWeek.start.getMonth(),
      }).toStrictEqual({ date: 31, day: 0, month: 11 });
    }
  );
});

describe("createMinuta() performance", () => {
  it("should execute in less than 100ms", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const start = performance.now();

    Array.from({ length: ITERATIONS }, () =>
      createMinuta({
        adapter: mockAdapter,
        date: ref(new Date()),
      })
    );

    const duration = performance.now() - start;
    expect(duration).toBeLessThan(MAX_DURATION_MS);
  });
});
