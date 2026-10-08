import { computed, effect, isRef, ref } from "vue";
import { describe, expect, it } from "vitest";
import { go, next as nextPeriod } from "minuta/operations";
import type { Period } from "minuta";
import { createMinuta } from "./create-minuta";
import { createNativeAdapter } from "minuta/native";
import { usePeriod } from "./use-period";

const ONE_YEAR = 1;
const ONE_RUN = 1;
const TWO_RUNS = 2;
const FEBRUARY = 1;
const YEAR_2024 = 2024;
const YEAR_2025 = 2025;

const adapter = createNativeAdapter();
const testDate = new Date("2024-01-15T00:00:00");

describe("usePeriod() reactivity", () => {
  it("should create reactive period from minuta", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const minuta = createMinuta({ adapter, date: ref(testDate) });
    const yearPeriod = usePeriod(minuta, "year");

    expect(isRef(yearPeriod)).toBe(true);
    expect(yearPeriod.value.type).toBe("year");
    expect(yearPeriod.value.start.getFullYear()).toBe(YEAR_2024);

    // Should update when browsing changes
    const runs: Period[] = [];
    effect(() => {
      runs.push(yearPeriod.value);
    });
    expect(runs).toHaveLength(ONE_RUN);
  });

  it(
    "should update the period when browsing changes",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const minuta = createMinuta({ adapter, date: ref(testDate) });
      const yearPeriod = usePeriod(minuta, "year");
      const runs: Period[] = [];
      effect(() => {
        runs.push(yearPeriod.value);
      });

      // Navigate to next year
      minuta.browsing.value = go(minuta.adapter, yearPeriod.value, ONE_YEAR);

      expect(runs).toHaveLength(TWO_RUNS);
      expect(yearPeriod.value.start.getFullYear()).toBe(YEAR_2025);
    }
  );
});

describe("usePeriod() with multiple periods", () => {
  it("should support multiple reactive periods", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const minuta = createMinuta({ adapter, date: ref(testDate) });
    const year = usePeriod(minuta, "year");
    const month = usePeriod(minuta, "month");
    const week = usePeriod(minuta, "week");
    const periodInfo = computed(() => ({
      month: month.value.start.getMonth(),
      weekStart: week.value.start.getDate(),
      year: year.value.start.getFullYear(),
    }));

    expect(periodInfo.value).toStrictEqual({
      month: 0,
      weekStart: expect.any(Number) as unknown,
      year: 2024,
    });

    // Navigate forward
    minuta.browsing.value = nextPeriod(minuta.adapter, month.value);

    expect(periodInfo.value.month).toBe(FEBRUARY);
    expect(periodInfo.value.year).toBe(YEAR_2024);
  });
});
