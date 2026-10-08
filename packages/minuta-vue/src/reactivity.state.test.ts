import type { AdapterUnit, ReadonlyPeriod } from "minuta";
import { computed, reactive, ref } from "vue";
import { describe, expect, it } from "vitest";
import { divide, next as nextPeriod } from "minuta/operations";
import { createMinuta } from "./create-minuta";
import { createNativeAdapter } from "minuta/native";
import { usePeriod } from "./use-period";

type CalendarView = "year" | "month" | "week" | "day";

const NONE = 0;
const STEP = 1;
const ONE_MATCH = 1;
const DAY_20 = 20;
const DAY_25 = 25;
const ITERATIONS = 10;
const MAX_DURATION_MS = 100;

const CHILD_UNIT: Readonly<Record<CalendarView, AdapterUnit>> = {
  day: "hour",
  month: "day",
  week: "day",
  year: "month",
};

const adapter = createNativeAdapter();
const testDate = new Date("2024-01-15T00:00:00");

/**
 * Returns the first item of a non-empty list.
 *
 * @param items - The list
 * @returns Its first item
 */
function firstOf<Item>(items: readonly Item[]): Item {
  const [item] = items;
  if (item === undefined) {
    throw new Error("Expected a non-empty list");
  }
  return item;
}

describe("reactive calendar state", () => {
  it("should support reactive calendar state", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const minuta = createMinuta({ adapter, date: ref(testDate) });
    const calendarState = reactive<{
      selectedDates: Date[];
      view: CalendarView;
    }>({ selectedDates: [], view: "month" });
    const currentViewInfo = computed(() => {
      const period = usePeriod(minuta, calendarState.view).value;
      const children = divide(
        minuta.adapter,
        period,
        CHILD_UNIT[calendarState.view]
      );
      return { childCount: children.length, periodType: period.type };
    });

    // Initial state - month view
    expect(currentViewInfo.value.periodType).toBe("month");
    expect(currentViewInfo.value.childCount).toBeGreaterThan(NONE);

    // Change to week view: 7 days in a week
    calendarState.view = "week";
    expect(currentViewInfo.value).toStrictEqual({
      childCount: 7,
      periodType: "week",
    });

    // Change to year view: 12 months in a year
    calendarState.view = "year";
    expect(currentViewInfo.value).toStrictEqual({
      childCount: 12,
      periodType: "year",
    });
  });
});

describe("reactive period highlighting", () => {
  it("should handle reactive period highlighting", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const minuta = createMinuta({ adapter, date: ref(testDate) });
    const highlightedDate = ref(new Date("2024-01-20T00:00:00"));
    const periods = computed(() =>
      divide(minuta.adapter, usePeriod(minuta, "month").value, "day")
    );
    const highlightedPeriods = computed(() =>
      periods.value.filter(
        (period: ReadonlyPeriod) =>
          period.start.getDate() === highlightedDate.value.getDate()
      )
    );

    expect(highlightedPeriods.value).toHaveLength(ONE_MATCH);
    expect(firstOf(highlightedPeriods.value).start.getDate()).toBe(DAY_20);

    // Change highlighted date
    highlightedDate.value = new Date("2024-01-25T00:00:00");
    expect(firstOf(highlightedPeriods.value).start.getDate()).toBe(DAY_25);
  });
});

describe("reactive performance", () => {
  it(
    "all reactive tests should complete in under 100ms",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const start = performance.now();
      const minuta = createMinuta({ adapter, date: ref(testDate) });

      // Create multiple reactive computations
      for (let index = 0; index < ITERATIONS; index += STEP) {
        const period = usePeriod(minuta, "day");
        computed(() => period.value.start.getTime());
      }

      // Trigger multiple updates
      for (let index = 0; index < ITERATIONS; index += STEP) {
        minuta.browsing.value = nextPeriod(
          minuta.adapter,
          minuta.browsing.value
        );
      }

      const duration = performance.now() - start;
      expect(duration).toBeLessThan(MAX_DURATION_MS);
    }
  );
});
