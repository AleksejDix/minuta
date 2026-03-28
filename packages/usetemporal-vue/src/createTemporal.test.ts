import { describe, it, expect, vi, beforeEach } from "vitest";
import { createTemporal } from "./createTemporal";
import type { CreateTemporalOptions } from "./types";
import { ref, isRef, effect, computed } from "vue";
import { createNativeAdapter } from "@allystudio/usetemporal/native";
import type { Adapter } from "@allystudio/usetemporal";

describe("createTemporal", () => {
  let mockAdapter: Adapter;
  let testDate: Date;

  beforeEach(() => {
    testDate = new Date(2024, 0, 15, 12, 30, 45); // Jan 15, 2024 12:30:45
    mockAdapter = createNativeAdapter();
  });

  describe("factory function validation", () => {
    it("should throw error when adapter is not provided", () => {
      const options = {
        date: ref(testDate),
      } as CreateTemporalOptions;

      expect(() => createTemporal(options)).toThrow(
        "A date adapter is required. Please install and provide an adapter from @allystudio/usetemporal/* packages."
      );
    });

    it("should throw error when adapter is null", () => {
      const options = {
        date: ref(testDate),
        adapter: null as any,
      };

      expect(() => createTemporal(options)).toThrow(
        "A date adapter is required"
      );
    });

    it("should throw error when adapter is undefined", () => {
      const options = {
        date: ref(testDate),
        adapter: undefined as any,
      };

      expect(() => createTemporal(options)).toThrow(
        "A date adapter is required"
      );
    });
  });

  describe("basic initialization", () => {
    it("should create temporal with required options", () => {
      const temporal = createTemporal({
        date: ref(testDate),
        adapter: mockAdapter,
      });

      expect(temporal).toBeDefined();
      expect(temporal.adapter).toBe(mockAdapter);
      expect(temporal.weekStartsOn).toBe(1); // Default Monday
      expect(isRef(temporal.browsing)).toBe(true);
      expect(isRef(temporal.now)).toBe(true);
    });

    it("should accept custom weekStartsOn values", () => {
      for (let day = 0; day <= 6; day++) {
        const temporal = createTemporal({
          date: ref(testDate),
          adapter: mockAdapter,
          weekStartsOn: day,
        });
        expect(temporal.weekStartsOn).toBe(day);
      }
    });

    it("should default locale to en", () => {
      const temporal = createTemporal({
        date: ref(testDate),
        adapter: mockAdapter,
      });
      expect(temporal.locale).toBe("en");
    });

    it("should accept custom locale", () => {
      const temporal = createTemporal({
        date: ref(testDate),
        adapter: mockAdapter,
        locale: "zh-CN",
      });
      expect(temporal.locale).toBe("zh-CN");
    });

    it("should use provided now date", () => {
      const nowDate = new Date(2024, 0, 20, 10, 0, 0);
      const temporal = createTemporal({
        date: ref(testDate),
        adapter: mockAdapter,
        now: ref(nowDate),
      });

      expect(temporal.now.value.start).toEqual(nowDate);
    });

    it("should default now to current date when not provided", () => {
      const beforeCreate = new Date();
      const temporal = createTemporal({
        date: ref(testDate),
        adapter: mockAdapter,
      });
      const afterCreate = new Date();

      const nowTime = temporal.now.value.start.getTime();
      expect(nowTime).toBeGreaterThanOrEqual(beforeCreate.getTime());
      expect(nowTime).toBeLessThanOrEqual(afterCreate.getTime());
    });
  });

  describe("reactive date handling", () => {
    it("should accept ref date and preserve reactivity", () => {
      const dateRef = ref(testDate);
      const temporal = createTemporal({
        date: dateRef,
        adapter: mockAdapter,
      });

      expect(temporal.browsing.value.start).toEqual(testDate);

      // Update ref
      const newDate = new Date(2024, 1, 1);
      dateRef.value = newDate;
      expect(temporal.browsing.value.start).toEqual(testDate); // browsing is its own ref
    });

    it("should accept ref now and preserve reactivity", () => {
      const nowRef = ref(new Date(2024, 0, 20));
      const temporal = createTemporal({
        date: ref(testDate),
        adapter: mockAdapter,
        now: nowRef,
      });

      expect(temporal.now.value.start).toEqual(nowRef.value);

      // Verify reactivity
      let effectCount = 0;
      effect(() => {
        temporal.now.value;
        effectCount++;
      });

      expect(effectCount).toBe(1);

      // Update ref
      nowRef.value = new Date(2024, 0, 21);
      expect(effectCount).toBe(2);
      expect(temporal.now.value.start).toEqual(nowRef.value);
    });
  });

  describe("period initialization", () => {
    it("should initialize browsing period correctly", () => {
      const temporal = createTemporal({
        date: ref(testDate),
        adapter: mockAdapter,
      });

      const browsing = temporal.browsing.value;
      expect(browsing.start).toEqual(testDate);
      expect(browsing.end).toEqual(testDate);
      expect(browsing.type).toBe("day");
      expect(browsing.start).toEqual(testDate);
    });

    it("should initialize now period as computed", () => {
      const nowDate = new Date(2024, 0, 20, 15, 30, 45);
      const temporal = createTemporal({
        date: ref(testDate),
        adapter: mockAdapter,
        now: ref(nowDate),
      });

      const now = temporal.now.value;
      expect(now.start).toEqual(nowDate);
      expect(now.end).toEqual(nowDate);
      expect(now.type).toBe("second");
      expect(now.start).toEqual(nowDate);
    });
  });

  describe("reactivity behavior", () => {
    it("should trigger effects when browsing changes", () => {
      const temporal = createTemporal({
        date: ref(testDate),
        adapter: mockAdapter,
      });

      let effectCount = 0;
      let lastBrowsing;

      effect(() => {
        lastBrowsing = temporal.browsing.value;
        effectCount++;
      });

      expect(effectCount).toBe(1);

      // Update browsing
      const newPeriod = {
        start: new Date(2024, 1, 1),
        end: new Date(2024, 1, 1),
        type: "day" as const,
        date: new Date(2024, 1, 1),
      };
      temporal.browsing.value = newPeriod;

      expect(effectCount).toBe(2);
      expect(lastBrowsing).toEqual(newPeriod);
    });

    it("should support computed properties based on temporal state", () => {
      const temporal = createTemporal({
        date: ref(testDate),
        adapter: mockAdapter,
      });

      const year = computed(() => temporal.browsing.value.start.getFullYear());
      const month = computed(() => temporal.browsing.value.start.getMonth());

      expect(year.value).toBe(2024);
      expect(month.value).toBe(0); // January

      // Update browsing
      temporal.browsing.value = {
        start: new Date(2025, 5, 15),
        end: new Date(2025, 5, 15),
        type: "day",
        date: new Date(2025, 5, 15),
      };

      expect(year.value).toBe(2025);
      expect(month.value).toBe(5); // June
    });

    it("should cleanup reactive effects properly", () => {
      const temporal = createTemporal({
        date: ref(testDate),
        adapter: mockAdapter,
      });

      let effectCount = 0;

      // Create effect runner
      const runner = effect(() => {
        temporal.browsing.value;
        effectCount++;
      });

      // Initial run
      expect(effectCount).toBeGreaterThan(0);
      const initialCount = effectCount;

      // Update should trigger effect
      temporal.browsing.value = {
        start: new Date(2025, 0, 1),
        end: new Date(2025, 0, 1),
        type: "day",
        date: new Date(2025, 0, 1),
      };

      expect(effectCount).toBeGreaterThan(initialCount);
      const countBeforeStop = effectCount;

      // Stop the effect
      runner.effect.stop();

      // Update should not trigger effect after stopping
      temporal.browsing.value = {
        start: new Date(2025, 6, 1),
        end: new Date(2025, 6, 1),
        type: "day",
        date: new Date(2025, 6, 1),
      };

      expect(effectCount).toBe(countBeforeStop); // No change after stop
    });

    it("should handle concurrent reactive updates", async () => {
      const dateRef = ref(testDate);
      const nowRef = ref(new Date(2024, 0, 20));

      const temporal = createTemporal({
        date: dateRef,
        adapter: mockAdapter,
        now: nowRef,
      });

      const updates: string[] = [];

      effect(() => {
        temporal.browsing.value;
        updates.push("browsing");
      });

      effect(() => {
        temporal.now.value;
        updates.push("now");
      });

      // Initial effects
      expect(updates).toEqual(["browsing", "now"]);

      // Update both refs
      dateRef.value = new Date(2024, 1, 1);
      nowRef.value = new Date(2024, 1, 1);

      await new Promise((resolve) => setTimeout(resolve, 0));

      // Should have triggered both effects
      expect(updates.length).toBe(3); // Initial + 1 now update
      expect(updates[2]).toBe("now");
    });
  });

  describe("edge cases", () => {
    it("should handle dates at year boundaries", () => {
      const endOfYear = new Date(2023, 11, 31, 23, 59, 59);
      const temporal = createTemporal({
        date: ref(endOfYear),
        adapter: mockAdapter,
      });

      expect(temporal.browsing.value.start).toEqual(endOfYear);
    });

    it("should handle leap year dates", () => {
      const leapDay = new Date(2024, 1, 29); // Feb 29, 2024
      const temporal = createTemporal({
        date: ref(leapDay),
        adapter: mockAdapter,
      });

      expect(temporal.browsing.value.start).toEqual(leapDay);
    });

    it("should handle invalid weekStartsOn gracefully", () => {
      const temporal = createTemporal({
        date: ref(testDate),
        adapter: mockAdapter,
        weekStartsOn: -1 as any,
      });

      expect(temporal.weekStartsOn).toBe(-1); // Uses provided value
    });

    it("should handle weekStartsOn as undefined", () => {
      const temporal = createTemporal({
        date: ref(testDate),
        adapter: mockAdapter,
        weekStartsOn: undefined,
      });

      expect(temporal.weekStartsOn).toBe(1); // Default Monday
    });
  });

  describe("adapter integration", () => {
    it("should work with different adapter implementations", () => {
      // Mock a custom adapter
      const customAdapter: Adapter = {
        startOf: vi.fn(),
        endOf: vi.fn(),
        add: vi.fn(),
        diff: vi.fn(),
      };

      const temporal = createTemporal({
        date: ref(testDate),
        adapter: customAdapter,
      });

      expect(temporal.adapter).toBe(customAdapter);
    });

    it("should preserve adapter reference", () => {
      const temporal = createTemporal({
        date: ref(testDate),
        adapter: mockAdapter,
      });

      expect(temporal.adapter).toBe(mockAdapter);
      expect(temporal.adapter.startOf).toBe(mockAdapter.startOf);
    });

    it("should recompute week periods when adapter weekStartsOn changes", () => {
      const date = new Date(2024, 0, 3, 12); // Wednesday
      const mondayAdapter = createNativeAdapter({ weekStartsOn: 1 });
      const sundayAdapter = createNativeAdapter({ weekStartsOn: 0 });

      const temporal = createTemporal({
        date,
        adapter: mondayAdapter,
      });

      const mondayWeek = temporal.derivePeriod(date, "week");
      expect(mondayWeek.start.getDay()).toBe(1);
      expect(mondayWeek.start.getDate()).toBe(1);

      temporal.adapter = sundayAdapter;

      const sundayWeek = temporal.derivePeriod(date, "week");
      expect(sundayWeek.start.getDay()).toBe(0);
      expect(sundayWeek.start.getDate()).toBe(31);
      expect(sundayWeek.start.getMonth()).toBe(11); // Dec 31, 2023
    });
  });

  describe("performance", () => {
    it("should execute in less than 100ms", () => {
      const start = performance.now();

      for (let i = 0; i < 100; i++) {
        createTemporal({
          date: ref(new Date()),
          adapter: mockAdapter,
        });
      }

      const duration = performance.now() - start;
      expect(duration).toBeLessThan(100);
    });
  });

  describe("browsing coverage across leap year", () => {
    const leapYearDates = Array.from(
      { length: 366 },
      (_, index) => new Date(2024, 0, 1 + index)
    );

    leapYearDates.forEach((targetDate) => {
      const label = targetDate.toISOString().slice(0, 10);

      it(`should assign browsing period for ${label}`, () => {
        const baseDate = new Date(Date.UTC(2024, 0, 1));
        const temporal = createTemporal({
          date: ref(baseDate),
          adapter: createNativeAdapter(),
        });

        const newPeriod = temporal.derivePeriod(new Date(targetDate), "day");
        temporal.browsing.value = newPeriod;

        expect(temporal.browsing.value.start.getTime()).toBe(
          targetDate.getTime()
        );
        const start = temporal.browsing.value.start;
        const end = temporal.browsing.value.end;

        expect(start.getFullYear()).toBe(targetDate.getFullYear());
        expect(start.getMonth()).toBe(targetDate.getMonth());
        expect(start.getDate()).toBe(targetDate.getDate());
        expect(end.getFullYear()).toBe(targetDate.getFullYear());
        expect(end.getMonth()).toBe(targetDate.getMonth());
        expect(end.getDate()).toBe(targetDate.getDate());
      });
    });
  });
});
