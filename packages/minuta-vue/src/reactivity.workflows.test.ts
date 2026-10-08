import type { Adapter, Period, ReadonlyPeriod } from "minuta";
import type { ComputedRef, ReactiveEffectRunner, Ref } from "vue";
import { computed, effect, ref } from "vue";
import { describe, expect, it } from "vitest";
import { divide, next as nextPeriod } from "minuta/operations";
import type { MinutaBuilder } from "./types";
import { createMinuta } from "./create-minuta";
import { createNativeAdapter } from "minuta/native";
import { usePeriod } from "./use-period";

const NONE = 0;
const DAYS_PER_WEEK = 7;
const TWO_WEEKS = 14;
const MIN_WEEKS_PER_MONTH = 4;
const MONTHS_PER_YEAR = 12;

const adapter = createNativeAdapter();
const testDate = new Date("2024-01-15T00:00:00");

type Selection = {
  selectedPeriods: Ref<Period[]>;
  selectionInfo: ComputedRef<{
    count: number;
    firstDate: Readonly<Date> | undefined;
    hasSelection: boolean;
  }>;
};

type CombinedSetup = {
  combined: ComputedRef<{ month: number; year: number }>;
  dateRef: Ref<Date>;
  minuta: MinutaBuilder;
  updates: string[];
};

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

/**
 * Divides a period into the next finer unit of the drill-down.
 *
 * @param dateAdapter - The date adapter
 * @param period - The period to divide
 * @returns The child periods, or the period itself below week level
 */
function drillDown(
  dateAdapter: Readonly<Adapter>,
  period: ReadonlyPeriod
): readonly ReadonlyPeriod[] {
  if (period.type === "year") {
    return divide(dateAdapter, period, "month");
  } else if (period.type === "month") {
    return divide(dateAdapter, period, "week");
  } else if (period.type === "week") {
    return divide(dateAdapter, period, "day");
  }
  return [period];
}

/**
 * Returns the start of the first period, if any.
 *
 * @param periods - The periods
 * @returns The first start date, or undefined for an empty list
 */
function firstStart(
  periods: readonly ReadonlyPeriod[]
): Readonly<Date> | undefined {
  const [first] = periods;
  if (first === undefined) {
    return undefined;
  }
  return first.start;
}

/**
 * Creates a selection of periods with derived information.
 *
 * @returns The selected periods and the derived information
 */
function createSelection(): Selection {
  const selectedPeriods = ref<Period[]>([]);
  const selectionInfo = computed(() => ({
    count: selectedPeriods.value.length,
    firstDate: firstStart(selectedPeriods.value),
    hasSelection: selectedPeriods.value.length > NONE,
  }));
  return { selectedPeriods, selectionInfo };
}

/**
 * Creates a minuta instance with an effect that records every browsing value.
 *
 * @returns The instance, the effect runner and the recorded values
 */
function trackBrowsing(): {
  minuta: MinutaBuilder;
  runner: ReactiveEffectRunner;
  runs: Period[];
} {
  const minuta = createMinuta({ adapter, date: ref(testDate) });
  const runs: Period[] = [];
  const runner = effect(() => {
    runs.push(minuta.browsing.value);
  });
  return { minuta, runner, runs };
}

/**
 * Creates year and month computeds and a combined computed, logging every
 * recomputation.
 *
 * @returns The combined computed, the date ref, the instance and the log
 */
function createCombined(): CombinedSetup {
  const dateRef = ref(testDate);
  const minuta = createMinuta({ adapter, date: dateRef });
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
      month: monthPeriod.value.start.getMonth(),
      year: yearPeriod.value.start.getFullYear(),
    };
  });
  return { combined, dateRef, minuta, updates };
}

describe("drill-down workflow", () => {
  it("should handle calendar drill-down reactively", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const minuta = createMinuta({ adapter, date: ref(testDate) });
    const currentPeriod = computed(() => minuta.browsing.value);
    const dividedPeriods = computed(() =>
      drillDown(minuta.adapter, currentPeriod.value)
    );

    // Start with year
    minuta.browsing.value = usePeriod(minuta, "year").value;
    expect(dividedPeriods.value).toHaveLength(MONTHS_PER_YEAR);

    // Drill down to January, then to its weeks
    minuta.browsing.value = firstOf(dividedPeriods.value);
    expect(dividedPeriods.value.length).toBeGreaterThanOrEqual(
      MIN_WEEKS_PER_MONTH
    );

    // Drill down to week
    minuta.browsing.value = firstOf(dividedPeriods.value);
    expect(dividedPeriods.value).toHaveLength(DAYS_PER_WEEK);
  });
});

describe("selection workflow", () => {
  it("should handle reactive period selection", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const minuta = createMinuta({ adapter, date: ref(testDate) });
    const { selectedPeriods, selectionInfo } = createSelection();

    expect(selectionInfo.value).toMatchObject({
      count: 0,
      hasSelection: false,
    });

    // Select the first week of days
    const days = divide(
      minuta.adapter,
      usePeriod(minuta, "month").value,
      "day"
    );
    selectedPeriods.value = days.slice(NONE, DAYS_PER_WEEK);

    expect(selectionInfo.value).toMatchObject({ count: 7, hasSelection: true });
    expect(selectionInfo.value.firstDate).toBeDefined();

    // Add more days
    selectedPeriods.value = [
      ...selectedPeriods.value,
      ...days.slice(DAYS_PER_WEEK, TWO_WEEKS),
    ];

    expect(selectionInfo.value.count).toBe(TWO_WEEKS);
  });
});

describe("effect cleanup workflow", () => {
  it("should clean up effects properly", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { minuta, runner, runs } = trackBrowsing();
    const initialCount = runs.length;
    expect(initialCount).toBeGreaterThan(NONE);

    // Update should trigger effect
    minuta.browsing.value = nextPeriod(
      minuta.adapter,
      usePeriod(minuta, "day").value
    );
    const countBeforeStop = runs.length;
    expect(countBeforeStop).toBeGreaterThan(initialCount);

    // Further updates should not trigger effect
    runner.effect.stop();
    minuta.browsing.value = nextPeriod(minuta.adapter, minuta.browsing.value);
    expect(runs).toHaveLength(countBeforeStop);
  });
});

describe("concurrent update workflow", () => {
  it(
    "should handle concurrent reactive updates efficiently",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const { combined, dateRef, minuta, updates } = createCombined();

      // Access to trigger initial computation
      expect(combined.value).toStrictEqual({ month: 0, year: 2024 });
      const initialUpdates = updates.length;

      // Change date
      dateRef.value = new Date("2025-06-15T00:00:00");
      minuta.browsing.value = {
        end: dateRef.value,
        start: dateRef.value,
        type: "day",
      };

      // Access again to trigger recomputation
      expect(combined.value).toStrictEqual({ month: 5, year: 2025 });

      // Should have efficient updates
      expect(updates.length).toBeGreaterThan(initialUpdates);
    }
  );
});
