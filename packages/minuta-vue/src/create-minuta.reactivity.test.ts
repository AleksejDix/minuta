import { computed, effect, ref } from "vue";
import { describe, expect, it } from "vitest";
import type { MinutaBuilder } from "./types";
import type { Period } from "minuta";
import type { ReactiveEffectRunner } from "vue";
import { createMinuta } from "./create-minuta";
import { createNativeAdapter } from "minuta/native";

const NONE = 0;
const NO_DELAY = 0;
const ONE_RUN = 1;
const TWO_RUNS = 2;
const JANUARY = 0;
const JUNE = 5;
const YEAR_2024 = 2024;
const YEAR_2025 = 2025;

const mockAdapter = createNativeAdapter();
const testDate = new Date("2024-01-15T12:30:45");

/**
 * Creates a day-typed point period at the given local ISO date.
 *
 * @param isoDate - Local ISO date string
 * @returns A period starting and ending at that instant
 */
function pointPeriod(isoDate: string): Period {
  return {
    end: new Date(isoDate),
    start: new Date(isoDate),
    type: "day",
  };
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
  const minuta = createMinuta({
    adapter: mockAdapter,
    date: ref(testDate),
  });
  const runs: Period[] = [];
  const runner = effect(() => {
    runs.push(minuta.browsing.value);
  });
  return { minuta, runner, runs };
}

/**
 * Runs one effect per source, in order, and logs the source's label on every run.
 *
 * @param sources - Labelled reactive reads
 * @returns The run log
 */
function logRuns(sources: Readonly<Record<string, () => unknown>>): string[] {
  const log: string[] = [];
  for (const [label, source] of Object.entries(sources)) {
    effect(() => {
      source();
      log.push(label);
    });
  }
  return log;
}

/**
 * Waits for one macrotask.
 *
 * @returns A promise resolved by a timer
 */
async function waitForMacrotask(): Promise<void> {
  // oxlint-disable-next-line promise/avoid-new -- A timer-based wait has no promise API in the ES2022 lib
  await new Promise((resolve) => {
    setTimeout(resolve, NO_DELAY);
  });
}

describe("createMinuta() effects", () => {
  it("should trigger effects when browsing changes", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const minuta = createMinuta({
      adapter: mockAdapter,
      date: ref(testDate),
    });

    const runs: Period[] = [];
    effect(() => {
      runs.push(minuta.browsing.value);
    });

    expect(runs).toHaveLength(ONE_RUN);

    // Update browsing
    const newPeriod = pointPeriod("2024-02-01T00:00:00");
    minuta.browsing.value = newPeriod;

    const [, lastBrowsing] = runs;
    expect(runs).toHaveLength(TWO_RUNS);
    expect(lastBrowsing).toStrictEqual(newPeriod);
  });

  it(
    "should support computed properties based on minuta state",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const minuta = createMinuta({
        adapter: mockAdapter,
        date: ref(testDate),
      });

      const year = computed(() => minuta.browsing.value.start.getFullYear());
      const month = computed(() => minuta.browsing.value.start.getMonth());

      expect(year.value).toBe(YEAR_2024);
      expect(month.value).toBe(JANUARY);

      // Update browsing
      minuta.browsing.value = pointPeriod("2025-06-15T00:00:00");

      expect(year.value).toBe(YEAR_2025);
      expect(month.value).toBe(JUNE);
    }
  );
});

describe("createMinuta() effect cleanup", () => {
  it("should cleanup reactive effects properly", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { minuta, runner, runs } = trackBrowsing();

    // Initial run
    const initialCount = runs.length;
    expect(initialCount).toBeGreaterThan(NONE);

    // Update should trigger effect
    minuta.browsing.value = pointPeriod("2025-01-01T00:00:00");
    const countBeforeStop = runs.length;
    expect(countBeforeStop).toBeGreaterThan(initialCount);

    // Update should not trigger effect after stopping
    runner.effect.stop();
    minuta.browsing.value = pointPeriod("2025-07-01T00:00:00");
    expect(runs).toHaveLength(countBeforeStop);
  });
});

describe("createMinuta() concurrent updates", () => {
  it(
    "should handle concurrent reactive updates",
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();
      const dateRef = ref(testDate);
      const nowRef = ref(new Date("2024-01-20T00:00:00"));
      const minuta = createMinuta({
        adapter: mockAdapter,
        date: dateRef,
        now: nowRef,
      });
      const updates = logRuns({
        browsing: () => minuta.browsing.value,
        now: () => minuta.now.value,
      });

      // Initial effects
      expect(updates).toStrictEqual(["browsing", "now"]);

      // Update both refs
      [dateRef.value, nowRef.value] = [
        new Date("2024-02-01T00:00:00"),
        new Date("2024-02-01T00:00:00"),
      ];
      await waitForMacrotask();

      // Initial runs plus one now update
      expect(updates).toStrictEqual(["browsing", "now", "now"]);
    }
  );
});
