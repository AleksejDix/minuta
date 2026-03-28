import { describe, it, expect, beforeEach } from "vitest";
import { ref, computed, effect, isRef, reactive } from "vue";
import { createNativeAdapter } from "minuta/native";
import { divide, go, next } from "minuta/operations";
import type { Adapter, Period } from "minuta";
import { createTemporal } from "./createTemporal";
import { usePeriod } from "./usePeriod";

describe("Vue Reactivity Integration", () => {
  let adapter: Adapter;
  let testDate: Date;

  beforeEach(() => {
    adapter = createNativeAdapter();
    testDate = new Date(2024, 0, 15);
  });

  describe("Temporal reactivity", () => {
    it("should update browsing period reactively", () => {
      const temporal = createTemporal({
        date: ref(testDate),
        adapter,
      });

      let effectCount = 0;
      let lastPeriod: Period;

      effect(() => {
        lastPeriod = temporal.browsing.value;
        effectCount++;
      });

      expect(effectCount).toBe(1);
      expect(lastPeriod!.start).toEqual(testDate);

      // Navigate forward
      const monthPeriod = usePeriod(temporal, "month");
      const nextMonth = next(temporal.adapter, monthPeriod.value);
      temporal.browsing.value = nextMonth;

      expect(effectCount).toBe(2);
      expect(lastPeriod!.start.getMonth()).toBe(1); // February
    });

    it("should handle reactive now updates", () => {
      const nowRef = ref(new Date(2024, 0, 1, 12, 0, 0));

      const temporal = createTemporal({
        date: ref(testDate),
        adapter,
        now: nowRef,
      });

      let nowEffectCount = 0;
      let lastNow: Period;

      effect(() => {
        lastNow = temporal.now.value;
        nowEffectCount++;
      });

      expect(nowEffectCount).toBe(1);
      expect(lastNow!.start).toEqual(nowRef.value);

      // Update now
      nowRef.value = new Date(2024, 0, 1, 13, 0, 0);

      expect(nowEffectCount).toBe(2);
      expect(lastNow!.start.getHours()).toBe(13);
    });

    it("should support computed properties based on temporal state", () => {
      const temporal = createTemporal({
        date: ref(testDate),
        adapter,
      });

      const currentMonth = computed(() => {
        return temporal.browsing.value.start.getMonth();
      });

      const monthName = computed(() => {
        const months = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        return months[currentMonth.value];
      });

      expect(currentMonth.value).toBe(0);
      expect(monthName.value).toBe("Jan");

      // Navigate to March
      const monthPeriod = usePeriod(temporal, "month");
      temporal.browsing.value = go(temporal.adapter, monthPeriod.value, 2);

      expect(currentMonth.value).toBe(2);
      expect(monthName.value).toBe("Mar");
    });
  });

  describe("usePeriod composable reactivity", () => {
    it("should create reactive period from temporal", () => {
      const temporal = createTemporal({
        date: ref(testDate),
        adapter,
      });

      const yearPeriod = usePeriod(temporal, "year");

      expect(isRef(yearPeriod)).toBe(true);
      expect(yearPeriod.value.type).toBe("year");
      expect(yearPeriod.value.start.getFullYear()).toBe(2024);

      // Should update when browsing changes
      let effectCount = 0;
      effect(() => {
        yearPeriod.value;
        effectCount++;
      });

      expect(effectCount).toBe(1);

      // Navigate to next year
      temporal.browsing.value = go(temporal.adapter, yearPeriod.value, 1);

      expect(effectCount).toBe(2);
      expect(yearPeriod.value.start.getFullYear()).toBe(2025);
    });

    it("should support multiple reactive periods", () => {
      const temporal = createTemporal({
        date: ref(testDate),
        adapter,
      });

      const year = usePeriod(temporal, "year");
      const month = usePeriod(temporal, "month");
      const week = usePeriod(temporal, "week");

      const periodInfo = computed(() => ({
        year: year.value.start.getFullYear(),
        month: month.value.start.getMonth(),
        weekStart: week.value.start.getDate(),
      }));

      expect(periodInfo.value).toEqual({
        year: 2024,
        month: 0,
        weekStart: expect.any(Number),
      });

      // Navigate forward
      temporal.browsing.value = next(temporal.adapter, month.value);

      expect(periodInfo.value.month).toBe(1);
      expect(periodInfo.value.year).toBe(2024);
    });
  });

  describe("Complex reactive workflows", () => {
    it("should handle calendar drill-down reactively", () => {
      const temporal = createTemporal({
        date: ref(testDate),
        adapter,
      });

      const currentPeriod = computed(() => temporal.browsing.value);
      const dividedPeriods = computed(() => {
        const period = currentPeriod.value;
        if (period.type === "year") {
          return divide(temporal.adapter, period, "month");
        } else if (period.type === "month") {
          return divide(temporal.adapter, period, "week");
        } else if (period.type === "week") {
          return divide(temporal.adapter, period, "day");
        }
        return [period];
      });

      // Start with year
      const yearPeriod = usePeriod(temporal, "year");
      temporal.browsing.value = yearPeriod.value;

      expect(dividedPeriods.value.length).toBe(12); // 12 months

      // Drill down to month
      temporal.browsing.value = dividedPeriods.value[0]; // January
      expect(dividedPeriods.value.length).toBeGreaterThanOrEqual(4); // weeks

      // Drill down to week
      temporal.browsing.value = dividedPeriods.value[0];
      expect(dividedPeriods.value.length).toBe(7); // 7 days
    });

    it("should handle reactive period selection", () => {
      const temporal = createTemporal({
        date: ref(testDate),
        adapter,
      });

      const selectedPeriods = ref<Period[]>([]);

      const selectionInfo = computed(() => {
        return {
          count: selectedPeriods.value.length,
          hasSelection: selectedPeriods.value.length > 0,
          firstDate: selectedPeriods.value[0]?.start,
        };
      });

      expect(selectionInfo.value.count).toBe(0);
      expect(selectionInfo.value.hasSelection).toBe(false);

      // Select some days
      const monthPeriod = usePeriod(temporal, "month").value;
      const days = divide(temporal.adapter, monthPeriod, "day");
      selectedPeriods.value = days.slice(0, 7); // First week

      expect(selectionInfo.value.count).toBe(7);
      expect(selectionInfo.value.hasSelection).toBe(true);
      expect(selectionInfo.value.firstDate).toBeDefined();

      // Add more days
      selectedPeriods.value = [...selectedPeriods.value, ...days.slice(7, 14)];

      expect(selectionInfo.value.count).toBe(14);
    });

    it("should clean up effects properly", () => {
      const temporal = createTemporal({
        date: ref(testDate),
        adapter,
      });

      let effectCount = 0;

      // Create and run effect
      const runner = effect(() => {
        temporal.browsing.value;
        effectCount++;
      });

      const initialCount = effectCount;
      expect(initialCount).toBeGreaterThan(0);

      // Update should trigger effect
      const dayPeriod = usePeriod(temporal, "day").value;
      temporal.browsing.value = next(temporal.adapter, dayPeriod);

      expect(effectCount).toBeGreaterThan(initialCount);
      const countBeforeStop = effectCount;

      // Stop the effect
      runner.effect.stop();

      // Further updates should not trigger effect
      temporal.browsing.value = next(temporal.adapter, temporal.browsing.value);

      expect(effectCount).toBe(countBeforeStop);
    });

    it("should handle concurrent reactive updates efficiently", () => {
      const dateRef = ref(testDate);
      const temporal = createTemporal({
        date: dateRef,
        adapter,
      });

      const updates: string[] = [];

      const yearPeriod = computed(() => {
        updates.push("year-computed");
        return usePeriod(temporal, "year").value;
      });

      const monthPeriod = computed(() => {
        updates.push("month-computed");
        return usePeriod(temporal, "month").value;
      });

      const combined = computed(() => {
        updates.push("combined-computed");
        return {
          year: yearPeriod.value.start.getFullYear(),
          month: monthPeriod.value.start.getMonth(),
        };
      });

      // Access to trigger initial computation
      expect(combined.value).toEqual({
        year: 2024,
        month: 0,
      });

      const initialUpdates = updates.length;

      // Change date
      dateRef.value = new Date(2025, 5, 15);
      temporal.browsing.value = {
        start: dateRef.value,
        end: dateRef.value,
        type: "day",
        date: dateRef,
      };

      // Access again to trigger recomputation
      expect(combined.value).toEqual({
        year: 2025,
        month: 5,
      });

      // Should have efficient updates
      expect(updates.length).toBeGreaterThan(initialUpdates);
    });
  });

  describe("Reactive state management patterns", () => {
    it("should support reactive calendar state", () => {
      const temporal = createTemporal({
        date: ref(testDate),
        adapter,
      });

      const calendarState = reactive({
        view: "month" as "year" | "month" | "week" | "day",
        selectedDates: [] as Date[],
      });

      const currentViewInfo = computed(() => {
        const period =
          calendarState.view === "year"
            ? usePeriod(temporal, "year").value
            : calendarState.view === "month"
              ? usePeriod(temporal, "month").value
              : calendarState.view === "week"
                ? usePeriod(temporal, "week").value
                : usePeriod(temporal, "day").value;

        const childUnit =
          calendarState.view === "year"
            ? "month"
            : calendarState.view === "month"
              ? "day"
              : calendarState.view === "week"
                ? "day"
                : "hour";

        const children = divide(temporal.adapter, period, childUnit);

        return {
          periodType: period.type,
          childCount: children.length,
          firstChildDate: children[0]?.date,
        };
      });

      // Initial state - month view
      expect(currentViewInfo.value.periodType).toBe("month");
      expect(currentViewInfo.value.childCount).toBeGreaterThan(0);

      // Change to week view
      calendarState.view = "week";
      expect(currentViewInfo.value.periodType).toBe("week");
      expect(currentViewInfo.value.childCount).toBe(7); // Days in week

      // Change to year view
      calendarState.view = "year";
      expect(currentViewInfo.value.periodType).toBe("year");
      expect(currentViewInfo.value.childCount).toBe(12); // Months in year
    });

    it("should handle reactive period highlighting", () => {
      const temporal = createTemporal({
        date: ref(testDate),
        adapter,
      });

      const highlightedDate = ref(new Date(2024, 0, 20));

      const periods = computed(() => {
        return divide(
          temporal.adapter,
          usePeriod(temporal, "month").value,
          "day"
        );
      });

      const highlightedPeriods = computed(() => {
        return periods.value.filter((p) => {
          return p.start.getDate() === highlightedDate.value.getDate();
        });
      });

      expect(highlightedPeriods.value.length).toBe(1);
      expect(highlightedPeriods.value[0].start.getDate()).toBe(20);

      // Change highlighted date
      highlightedDate.value = new Date(2024, 0, 25);
      expect(highlightedPeriods.value[0].start.getDate()).toBe(25);
    });
  });

  describe("Performance", () => {
    it("all reactive tests should complete in under 100ms", () => {
      const start = performance.now();

      const temporal = createTemporal({
        date: ref(testDate),
        adapter,
      });

      // Create multiple reactive computations
      for (let i = 0; i < 10; i++) {
        const period = usePeriod(temporal, "day");
        computed(() => period.value.start.getTime());
      }

      // Trigger multiple updates
      for (let i = 0; i < 10; i++) {
        temporal.browsing.value = next(
          temporal.adapter,
          temporal.browsing.value
        );
      }

      const duration = performance.now() - start;
      expect(duration).toBeLessThan(100);
    });
  });
});
