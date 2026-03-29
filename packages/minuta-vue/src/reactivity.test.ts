import { describe, it, expect, beforeEach } from "vitest";
import { ref, computed, effect, isRef, reactive } from "vue";
import { createNativeAdapter } from "minuta/native";
import { divide, go, next } from "minuta/operations";
import type { Adapter, Period } from "minuta";
import { createMinuta } from "./createMinuta";
import { usePeriod } from "./usePeriod";

describe("Vue Reactivity Integration", () => {
  let adapter: Adapter;
  let testDate: Date;

  beforeEach(() => {
    adapter = createNativeAdapter();
    testDate = new Date(2024, 0, 15);
  });

  describe("Minuta reactivity", () => {
    it("should update browsing period reactively", () => {
      const minuta = createMinuta({
        date: ref(testDate),
        adapter,
      });

      let effectCount = 0;
      let lastPeriod: Period;

      effect(() => {
        lastPeriod = minuta.browsing.value;
        effectCount++;
      });

      expect(effectCount).toBe(1);
      expect(lastPeriod!.start).toEqual(testDate);

      // Navigate forward
      const monthPeriod = usePeriod(minuta, "month");
      const nextMonth = next(minuta.adapter, monthPeriod.value);
      minuta.browsing.value = nextMonth;

      expect(effectCount).toBe(2);
      expect(lastPeriod!.start.getMonth()).toBe(1); // February
    });

    it("should handle reactive now updates", () => {
      const nowRef = ref(new Date(2024, 0, 1, 12, 0, 0));

      const minuta = createMinuta({
        date: ref(testDate),
        adapter,
        now: nowRef,
      });

      let nowEffectCount = 0;
      let lastNow: Period;

      effect(() => {
        lastNow = minuta.now.value;
        nowEffectCount++;
      });

      expect(nowEffectCount).toBe(1);
      expect(lastNow!.start).toEqual(nowRef.value);

      // Update now
      nowRef.value = new Date(2024, 0, 1, 13, 0, 0);

      expect(nowEffectCount).toBe(2);
      expect(lastNow!.start.getHours()).toBe(13);
    });

    it("should support computed properties based on minuta state", () => {
      const minuta = createMinuta({
        date: ref(testDate),
        adapter,
      });

      const currentMonth = computed(() => {
        return minuta.browsing.value.start.getMonth();
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
      const monthPeriod = usePeriod(minuta, "month");
      minuta.browsing.value = go(minuta.adapter, monthPeriod.value, 2);

      expect(currentMonth.value).toBe(2);
      expect(monthName.value).toBe("Mar");
    });
  });

  describe("usePeriod composable reactivity", () => {
    it("should create reactive period from minuta", () => {
      const minuta = createMinuta({
        date: ref(testDate),
        adapter,
      });

      const yearPeriod = usePeriod(minuta, "year");

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
      minuta.browsing.value = go(minuta.adapter, yearPeriod.value, 1);

      expect(effectCount).toBe(2);
      expect(yearPeriod.value.start.getFullYear()).toBe(2025);
    });

    it("should support multiple reactive periods", () => {
      const minuta = createMinuta({
        date: ref(testDate),
        adapter,
      });

      const year = usePeriod(minuta, "year");
      const month = usePeriod(minuta, "month");
      const week = usePeriod(minuta, "week");

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
      minuta.browsing.value = next(minuta.adapter, month.value);

      expect(periodInfo.value.month).toBe(1);
      expect(periodInfo.value.year).toBe(2024);
    });
  });

  describe("Complex reactive workflows", () => {
    it("should handle calendar drill-down reactively", () => {
      const minuta = createMinuta({
        date: ref(testDate),
        adapter,
      });

      const currentPeriod = computed(() => minuta.browsing.value);
      const dividedPeriods = computed(() => {
        const period = currentPeriod.value;
        if (period.type === "year") {
          return divide(minuta.adapter, period, "month");
        } else if (period.type === "month") {
          return divide(minuta.adapter, period, "week");
        } else if (period.type === "week") {
          return divide(minuta.adapter, period, "day");
        }
        return [period];
      });

      // Start with year
      const yearPeriod = usePeriod(minuta, "year");
      minuta.browsing.value = yearPeriod.value;

      expect(dividedPeriods.value.length).toBe(12); // 12 months

      // Drill down to month
      minuta.browsing.value = dividedPeriods.value[0]; // January
      expect(dividedPeriods.value.length).toBeGreaterThanOrEqual(4); // weeks

      // Drill down to week
      minuta.browsing.value = dividedPeriods.value[0];
      expect(dividedPeriods.value.length).toBe(7); // 7 days
    });

    it("should handle reactive period selection", () => {
      const minuta = createMinuta({
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
      const monthPeriod = usePeriod(minuta, "month").value;
      const days = divide(minuta.adapter, monthPeriod, "day");
      selectedPeriods.value = days.slice(0, 7); // First week

      expect(selectionInfo.value.count).toBe(7);
      expect(selectionInfo.value.hasSelection).toBe(true);
      expect(selectionInfo.value.firstDate).toBeDefined();

      // Add more days
      selectedPeriods.value = [...selectedPeriods.value, ...days.slice(7, 14)];

      expect(selectionInfo.value.count).toBe(14);
    });

    it("should clean up effects properly", () => {
      const minuta = createMinuta({
        date: ref(testDate),
        adapter,
      });

      let effectCount = 0;

      // Create and run effect
      const runner = effect(() => {
        minuta.browsing.value;
        effectCount++;
      });

      const initialCount = effectCount;
      expect(initialCount).toBeGreaterThan(0);

      // Update should trigger effect
      const dayPeriod = usePeriod(minuta, "day").value;
      minuta.browsing.value = next(minuta.adapter, dayPeriod);

      expect(effectCount).toBeGreaterThan(initialCount);
      const countBeforeStop = effectCount;

      // Stop the effect
      runner.effect.stop();

      // Further updates should not trigger effect
      minuta.browsing.value = next(minuta.adapter, minuta.browsing.value);

      expect(effectCount).toBe(countBeforeStop);
    });

    it("should handle concurrent reactive updates efficiently", () => {
      const dateRef = ref(testDate);
      const minuta = createMinuta({
        date: dateRef,
        adapter,
      });

      const updates: string[] = [];

      const yearPeriod = computed(() => {
        updates.push("year-computed");
        return usePeriod(minuta, "year").value;
      });

      const monthPeriod = computed(() => {
        updates.push("month-computed");
        return usePeriod(minuta, "month").value;
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
      minuta.browsing.value = {
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
      const minuta = createMinuta({
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
            ? usePeriod(minuta, "year").value
            : calendarState.view === "month"
              ? usePeriod(minuta, "month").value
              : calendarState.view === "week"
                ? usePeriod(minuta, "week").value
                : usePeriod(minuta, "day").value;

        const childUnit =
          calendarState.view === "year"
            ? "month"
            : calendarState.view === "month"
              ? "day"
              : calendarState.view === "week"
                ? "day"
                : "hour";

        const children = divide(minuta.adapter, period, childUnit);

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
      const minuta = createMinuta({
        date: ref(testDate),
        adapter,
      });

      const highlightedDate = ref(new Date(2024, 0, 20));

      const periods = computed(() => {
        return divide(minuta.adapter, usePeriod(minuta, "month").value, "day");
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

      const minuta = createMinuta({
        date: ref(testDate),
        adapter,
      });

      // Create multiple reactive computations
      for (let i = 0; i < 10; i++) {
        const period = usePeriod(minuta, "day");
        computed(() => period.value.start.getTime());
      }

      // Trigger multiple updates
      for (let i = 0; i < 10; i++) {
        minuta.browsing.value = next(minuta.adapter, minuta.browsing.value);
      }

      const duration = performance.now() - start;
      expect(duration).toBeLessThan(100);
    });
  });
});
