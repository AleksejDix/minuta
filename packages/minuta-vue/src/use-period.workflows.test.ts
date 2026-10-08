import type { ComputedRef, Ref } from "vue";
import type { MinutaState, Period, Unit } from "./types";
import { computed, effect, ref } from "vue";
import { describe, expect, it } from "vitest";
import { probeInRoot } from "./test/mount";
import { useMinutaContext } from "./minuta-context";
import { usePeriod } from "./use-period";

const NONE = 0;
const ONE_MATCH = 1;
const DAYS_PER_WEEK = 7;
const TWO_WEEKS = 14;
const MIN_WEEKS_PER_MONTH = 4;
const MONTHS_PER_YEAR = 12;
const DAY_20 = 20;
const DAY_25 = 25;
const ITERATIONS = 10;
const STEP = 1;
const MAX_DURATION_MS = 100;

const CHILD_UNIT: Readonly<Partial<Record<Unit | "custom", Unit>>> = {
  month: "week",
  week: "day",
  year: "month",
};

const testDate = new Date("2024-01-15T00:00:00");

type DrillDown = Readonly<{
  children: ComputedRef<readonly Period[]>;
  minuta: MinutaState;
  unit: Ref<Unit>;
}>;

type Probe = Readonly<{
  minuta: MinutaState;
  month: ComputedRef<Period>;
}>;

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
 * @param minuta - The minuta state
 * @param period - The period to divide
 * @returns The child periods, or the period itself below week level
 */
function childrenOf(minuta: MinutaState, period: Period): readonly Period[] {
  const child = CHILD_UNIT[period.unit];
  if (child === undefined) {
    return [period];
  }
  return minuta.divide(period, child);
}

/**
 * Browses the first child and shows it in the next finer unit.
 *
 * @param drillDown - The state, the shown unit and the current children
 * @param next - The next finer unit
 */
function drill(drillDown: DrillDown, next: Unit): void {
  drillDown.minuta.browse(firstOf(drillDown.children.value));
  drillDown.unit.value = next;
}

/**
 * Mounts a root browsing the test date and returns its state and month.
 *
 * @returns The minuta state and the browsed month
 */
function probeMonth(): Probe {
  return probeInRoot(
    () => ({ minuta: useMinutaContext(), month: usePeriod("month") }),
    { date: testDate }
  ).result;
}

describe("drill-down workflow", () => {
  it("drills down from a year to the days of a week", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const unit = ref<Unit>("year");
    const { current, minuta } = probeInRoot(
      () => ({ current: usePeriod(unit), minuta: useMinutaContext() }),
      { date: testDate }
    ).result;
    const children = computed(() => childrenOf(minuta, current.value));
    expect(children.value).toHaveLength(MONTHS_PER_YEAR);

    drill({ children, minuta, unit }, "month");
    expect(children.value.length).toBeGreaterThanOrEqual(MIN_WEEKS_PER_MONTH);

    drill({ children, minuta, unit }, "week");
    expect(children.value).toHaveLength(DAYS_PER_WEEK);
  });
});

describe("selection workflow", () => {
  it("derives information from selected days", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { minuta, month } = probeMonth();
    const selected = ref<Period[]>([]);
    const info = computed(() => ({
      count: selected.value.length,
      hasSelection: selected.value.length > NONE,
    }));
    expect(info.value).toStrictEqual({ count: 0, hasSelection: false });

    const days = minuta.divide(month.value, "day");
    selected.value = days.slice(NONE, DAYS_PER_WEEK);
    expect(info.value).toStrictEqual({ count: 7, hasSelection: true });

    selected.value = [
      ...selected.value,
      ...days.slice(DAYS_PER_WEEK, TWO_WEEKS),
    ];
    expect(info.value.count).toBe(TWO_WEEKS);
  });

  it("highlights the day of a reactive date", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { minuta, month } = probeMonth();
    const highlighted = ref(new Date("2024-01-20T00:00:00"));
    const matches = computed(() =>
      minuta
        .divide(month.value, "day")
        .filter((day) => minuta.contains(day, highlighted.value))
    );
    expect(matches.value).toHaveLength(ONE_MATCH);
    expect(firstOf(matches.value).start.getDate()).toBe(DAY_20);

    highlighted.value = new Date("2024-01-25T00:00:00");
    expect(firstOf(matches.value).start.getDate()).toBe(DAY_25);
  });
});

describe("combined computed workflow", () => {
  it("recomputes derived state after browsing", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { result } = probeInRoot(
      () => ({
        minuta: useMinutaContext(),
        month: usePeriod("month"),
        year: usePeriod("year"),
      }),
      { date: testDate }
    );
    const updates: string[] = [];
    const combined = computed(() => {
      updates.push("combined");
      return {
        month: result.month.value.start.getMonth(),
        year: result.year.value.start.getFullYear(),
      };
    });
    expect(combined.value).toStrictEqual({ month: 0, year: 2024 });
    const initialUpdates = updates.length;

    result.minuta.browse(
      result.minuta.period(new Date("2025-06-15T00:00:00"), "day")
    );

    expect(combined.value).toStrictEqual({ month: 5, year: 2025 });
    expect(updates.length).toBeGreaterThan(initialUpdates);
  });
});

describe("reactive performance", () => {
  it(
    "handles many periods and updates in under 100ms",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const start = performance.now();
      const { result } = probeInRoot(
        () => ({
          days: Array.from({ length: ITERATIONS }, () => usePeriod("day")),
          minuta: useMinutaContext(),
        }),
        { date: testDate }
      );
      const runs: number[] = [];
      for (const day of result.days) {
        effect(() => {
          runs.push(day.value.start.getTime());
        });
      }

      for (let index = 0; index < ITERATIONS; index += STEP) {
        result.minuta.browse(result.minuta.next(result.minuta.browsing.value));
      }

      expect(runs).toHaveLength(ITERATIONS * (ITERATIONS + STEP));
      expect(performance.now() - start).toBeLessThan(MAX_DURATION_MS);
    }
  );
});
