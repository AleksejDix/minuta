import { computed, effect, ref, shallowRef } from "vue";
import { describe, expect, it } from "vitest";
import type { MinutaState } from "./types";
import type { Period } from "minuta/core";
import type { ReactiveEffectRunner } from "vue";
import { nativeUnits } from "minuta/native";
import { useMinuta } from "./use-minuta";

const NONE = 0;
const ONE_RUN = 1;
const TWO_RUNS = 2;
const JANUARY = 0;
const MARCH = 2;
const JUNE = 5;
const TWO_MONTHS = 2;
const YEAR_2024 = 2024;
const YEAR_2025 = 2025;
const SUNDAY = 0;
const MONDAY = 1;
const ONE_HOUR_PAST_NOON = 13;
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr"] as const;

const testDate = new Date("2024-01-15T12:30:45");

/**
 * Creates a minuta state with an effect that records every browsing value.
 *
 * @returns The state, the effect runner and the recorded values
 */
function useTrackedBrowsing(): {
  minuta: MinutaState;
  runner: ReactiveEffectRunner;
  runs: Period[];
} {
  const minuta = useMinuta({ date: testDate });
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

describe("useMinuta() browsing", () => {
  it("triggers effects when browsing changes", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { minuta, runs } = useTrackedBrowsing();
    expect(runs).toHaveLength(ONE_RUN);

    minuta.browse(minuta.next(minuta.browsing.value));

    const [, lastBrowsing] = runs;
    expect(runs).toHaveLength(TWO_RUNS);
    expect(lastBrowsing).toStrictEqual(
      minuta.period(new Date("2024-02-01T00:00:00"), "month")
    );
  });

  it(
    "browses the period containing the start of any period",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const minuta = useMinuta({ date: testDate });

      minuta.browse(minuta.period(new Date("2024-03-20T00:00:00"), "day"));

      expect(minuta.browsing.value.unit).toBe("month");
      expect(minuta.browsing.value.start.getMonth()).toBe(MARCH);
    }
  );
});

describe("useMinuta() derived state", () => {
  it(
    "supports computed properties based on the state",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const minuta = useMinuta({ date: testDate });
      const year = computed(() => minuta.browsing.value.start.getFullYear());
      const month = computed(() => minuta.browsing.value.start.getMonth());
      expect([year.value, month.value]).toStrictEqual([YEAR_2024, JANUARY]);

      minuta.browse(minuta.period(new Date("2025-06-15T00:00:00"), "day"));

      expect([year.value, month.value]).toStrictEqual([YEAR_2025, JUNE]);
    }
  );

  it("derives labels from the browsed month", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const minuta = useMinuta({ date: testDate });
    const monthName = computed(
      () => MONTH_NAMES[minuta.browsing.value.start.getMonth()]
    );
    expect(monthName.value).toBe("Jan");

    minuta.browse(minuta.shift(minuta.browsing.value, TWO_MONTHS));

    expect(monthName.value).toBe("Mar");
  });

  it("cleans up effects", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { minuta, runner, runs } = useTrackedBrowsing();
    const initialCount = runs.length;
    expect(initialCount).toBeGreaterThan(NONE);

    minuta.browse(minuta.next(minuta.browsing.value));
    const countBeforeStop = runs.length;
    expect(countBeforeStop).toBeGreaterThan(initialCount);

    runner.effect.stop();
    minuta.browse(minuta.next(minuta.browsing.value));
    expect(runs).toHaveLength(countBeforeStop);
  });
});

describe("useMinuta() reactive options", () => {
  it("uses date only as the initial date", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const dateRef = shallowRef(testDate);
    const minuta = useMinuta(() => ({ date: dateRef.value }));

    dateRef.value = new Date("2024-02-01T00:00:00");

    expect(minuta.browsing.value.start.getMonth()).toBe(JANUARY);
  });
});

describe("useMinuta() reactive now", () => {
  it("follows a reactive now", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const nowRef = shallowRef(new Date("2024-01-01T12:00:00"));
    const minuta = useMinuta(() => ({ date: testDate, now: nowRef.value }));
    const runs: Period[] = [];
    effect(() => {
      runs.push(minuta.now.value);
    });

    nowRef.value = new Date("2024-01-01T13:00:00");

    expect(runs).toHaveLength(TWO_RUNS);
    expect(minuta.now.value.start.getHours()).toBe(ONE_HOUR_PAST_NOON);
  });

  it("updates only what depends on a changed option", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const dateRef = shallowRef(testDate);
    const nowRef = shallowRef(new Date("2024-01-20T00:00:00"));
    const minuta = useMinuta(() => ({
      date: dateRef.value,
      now: nowRef.value,
    }));
    const log = logRuns({
      browsing: () => minuta.browsing.value,
      now: () => minuta.now.value,
    });

    [dateRef.value, nowRef.value] = [
      new Date("2024-02-01T00:00:00"),
      new Date("2024-02-01T00:00:00"),
    ];

    expect(log).toStrictEqual(["browsing", "now", "now"]);
  });
});

describe("useMinuta() reactive units and unit", () => {
  it("recomputes periods when the units change", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const date = new Date("2024-01-03T12:00:00");
    const units = shallowRef(nativeUnits({ weekStartsOn: MONDAY }));
    const minuta = useMinuta(() => ({
      date,
      unit: "week",
      units: units.value,
    }));
    expect(minuta.browsing.value.start).toStrictEqual(
      new Date("2024-01-01T00:00:00")
    );

    units.value = nativeUnits({ weekStartsOn: SUNDAY });

    expect(minuta.browsing.value.start).toStrictEqual(
      new Date("2023-12-31T00:00:00")
    );
    expect(minuta.period(date, "week").start.getDay()).toBe(SUNDAY);
  });

  it("recomputes browsing when the unit changes", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const unit = ref<"month" | "year">("month");
    const minuta = useMinuta(() => ({ date: testDate, unit: unit.value }));

    unit.value = "year";

    expect(minuta.browsing.value).toStrictEqual(
      minuta.period(testDate, "year")
    );
    expect(minuta.browsing.value.start.getMonth()).toBe(JANUARY);
    expect(minuta.next(minuta.browsing.value).start.getFullYear()).toBe(
      YEAR_2025
    );
  });
});
