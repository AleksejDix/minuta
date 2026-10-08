import type { Period, Unit } from "minuta/core";
import { computed, effect, isRef, ref } from "vue";
import { describe, expect, it } from "vitest";
import { probeInRoot, silenceVueWarnings } from "./test/mount";
import { nativeUnits } from "minuta/native";
import { useMinutaContext } from "./minuta-context";
import { usePeriod } from "./use-period";

const ONE_RUN = 1;
const TWO_RUNS = 2;
const ONE_YEAR = 1;
const JANUARY = 0;
const FEBRUARY = 1;
const SUNDAY = 0;
const YEAR_2024 = 2024;
const YEAR_2025 = 2025;
const DAYS_IN_JANUARY = 31;
const DAYS_PER_WEEK = 7;
const DAYS_IN_2024 = 366;

const testDate = new Date("2024-01-15T00:00:00");

describe("usePeriod()", () => {
  it("returns a computed period of the unit", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { result: year } = probeInRoot(() => usePeriod("year"), {
      date: testDate,
    });

    expect(isRef(year)).toBe(true);
    expect(year.value.unit).toBe("year");
    expect(year.value.start.getFullYear()).toBe(YEAR_2024);
  });

  it("contains the start of the browsed period", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { result: week } = probeInRoot(() => usePeriod("week"), {
      date: testDate,
    });

    expect(week.value.start).toStrictEqual(new Date("2024-01-01T00:00:00"));
  });

  it("uses the units of the root", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { result: week } = probeInRoot(() => usePeriod("week"), {
      date: testDate,
      units: nativeUnits({ weekStartsOn: SUNDAY }),
    });

    expect(week.value.start).toStrictEqual(new Date("2023-12-31T00:00:00"));
  });

  it("throws outside MinutaRoot", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const warn = silenceVueWarnings();
    expect(() => usePeriod("day")).toThrow(
      "useMinutaContext() must be used within <MinutaRoot>"
    );
    expect(warn.mock.calls.flat()).toContainEqual(
      expect.stringContaining("[Vue warn]")
    );
  });
});

describe("usePeriod() reactivity", () => {
  it("updates when browsing changes", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { result } = probeInRoot(
      () => ({ minuta: useMinutaContext(), year: usePeriod("year") }),
      { date: testDate }
    );
    const { minuta, year } = result;
    const runs: Period[] = [];
    effect(() => {
      runs.push(year.value);
    });
    expect(runs).toHaveLength(ONE_RUN);

    minuta.browse(minuta.shift(year.value, ONE_YEAR));

    expect(runs).toHaveLength(TWO_RUNS);
    expect(year.value.start.getFullYear()).toBe(YEAR_2025);
  });
});

describe("usePeriod() with several periods", () => {
  it("supports several periods at once", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { result } = probeInRoot(
      () => ({
        minuta: useMinutaContext(),
        month: usePeriod("month"),
        week: usePeriod("week"),
        year: usePeriod("year"),
      }),
      { date: testDate }
    );
    const { minuta, month, week, year } = result;
    const info = computed(() => ({
      month: month.value.start.getMonth(),
      weekStart: week.value.start.getDate(),
      year: year.value.start.getFullYear(),
    }));
    expect(info.value).toStrictEqual({
      month: JANUARY,
      weekStart: 1,
      year: YEAR_2024,
    });

    minuta.browse(minuta.next(month.value));

    expect(info.value).toStrictEqual({
      month: FEBRUARY,
      weekStart: 29,
      year: YEAR_2024,
    });
  });
});

describe("usePeriod() reactive unit", () => {
  it("follows a reactive unit", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const unit = ref<Unit>("month");
    const { result } = probeInRoot(
      () => ({ minuta: useMinutaContext(), period: usePeriod(unit) }),
      { date: testDate }
    );
    const { minuta, period } = result;
    const childCount = computed(
      () => minuta.divide(period.value, "day").length
    );
    expect([period.value.unit, childCount.value]).toStrictEqual([
      "month",
      DAYS_IN_JANUARY,
    ]);

    unit.value = "week";
    expect([period.value.unit, childCount.value]).toStrictEqual([
      "week",
      DAYS_PER_WEEK,
    ]);

    unit.value = "year";
    expect([period.value.unit, childCount.value]).toStrictEqual([
      "year",
      DAYS_IN_2024,
    ]);
  });

  it("follows a getter", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const view = ref<"day" | "year">("day");
    const { result: period } = probeInRoot(() => usePeriod(() => view.value), {
      date: testDate,
    });
    expect(period.value.unit).toBe("day");

    view.value = "year";

    expect(period.value.unit).toBe("year");
  });
});
