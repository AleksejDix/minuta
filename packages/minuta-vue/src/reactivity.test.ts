import { computed, effect, ref } from "vue";
import { describe, expect, it } from "vitest";
import { go, next as nextPeriod } from "minuta/operations";
import type { Period } from "minuta";
import { createMinuta } from "./create-minuta";
import { createNativeAdapter } from "minuta/native";
import { usePeriod } from "./use-period";

const JANUARY = 0;
const FEBRUARY = 1;
const MARCH = 2;
const TWO_MONTHS = 2;
const LAST_INDEX = -1;
const TWO_RUNS = 2;
const ONE_HOUR_PAST_NOON = 13;
const MONTH_NAMES = [
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
] as const;

const adapter = createNativeAdapter();
const testDate = new Date("2024-01-15T00:00:00");

/**
 * Returns the last item of a non-empty list.
 *
 * @param items - The list
 * @returns Its last item
 */
function lastOf<Item>(items: readonly Item[]): Item {
  const item = items.at(LAST_INDEX);
  if (item === undefined) {
    throw new Error("Expected a non-empty list");
  }
  return item;
}

describe("minuta browsing reactivity", () => {
  it("should update browsing period reactively", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const minuta = createMinuta({ adapter, date: ref(testDate) });
    const runs: Period[] = [];
    effect(() => {
      runs.push(minuta.browsing.value);
    });

    expect(runs).toStrictEqual([expect.objectContaining({ start: testDate })]);

    // Navigate forward
    const monthPeriod = usePeriod(minuta, "month");
    minuta.browsing.value = nextPeriod(minuta.adapter, monthPeriod.value);

    expect(runs).toHaveLength(TWO_RUNS);
    expect(lastOf(runs).start.getMonth()).toBe(FEBRUARY);
  });

  it("should handle reactive now updates", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const nowRef = ref(new Date("2024-01-01T12:00:00"));
    const minuta = createMinuta({ adapter, date: ref(testDate), now: nowRef });
    const runs: Period[] = [];
    effect(() => {
      runs.push(minuta.now.value);
    });

    expect(runs).toStrictEqual([
      expect.objectContaining({ start: nowRef.value }),
    ]);

    // Update now
    nowRef.value = new Date("2024-01-01T13:00:00");

    expect(runs).toHaveLength(TWO_RUNS);
    expect(lastOf(runs).start.getHours()).toBe(ONE_HOUR_PAST_NOON);
  });
});

describe("minuta computed reactivity", () => {
  it(
    "should support computed properties based on minuta state",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const minuta = createMinuta({ adapter, date: ref(testDate) });
      const currentMonth = computed(() =>
        minuta.browsing.value.start.getMonth()
      );
      const monthName = computed(() => MONTH_NAMES[currentMonth.value]);

      expect(currentMonth.value).toBe(JANUARY);
      expect(monthName.value).toBe("Jan");

      // Navigate to March
      const monthPeriod = usePeriod(minuta, "month");
      minuta.browsing.value = go(minuta.adapter, monthPeriod.value, TWO_MONTHS);

      expect(currentMonth.value).toBe(MARCH);
      expect(monthName.value).toBe("Mar");
    }
  );
});
