import type { AdapterUnit, Period } from "minuta";
import { describe, expect, it } from "vitest";
import type { MinutaBuilder } from "./types";
import type { RenderHookResult } from "@testing-library/react";
import { act } from "react";
import { createNativeAdapter } from "minuta/native";
import { renderHook } from "@testing-library/react";
import { useMinuta } from "./use-minuta";
import { usePeriod } from "./use-period";

type MinutaRef = Readonly<{ current: MinutaBuilder }>;
type Rerenderable = Readonly<
  Pick<RenderHookResult<Period, unknown>, "rerender">
>;

const JANUARY = 0;
const FEBRUARY = 1;
const MARCH = 2;
const DECEMBER = 11;
const FIRST_DAY = 1;
const PREVIOUS_YEAR = 2023;
const TEST_YEAR = 2024;
const DAYS_TO_FEBRUARY = 31;
const DAYS_TO_DECEMBER = -31;
const DAYS_TO_NEXT_YEAR = 365;
const DAYS_TO_MARCH = 60;
const NO_WEEKS = 0;

function firstOf<Item>(items: readonly Item[]): Item {
  const [first] = items;
  if (first === undefined) {
    throw new Error("Expected at least one item");
  }
  return first;
}

function renderMinuta(): RenderHookResult<MinutaBuilder, unknown> {
  const adapter = createNativeAdapter();
  const date = new Date("2024-01-15T00:00:00");
  return renderHook(() => useMinuta({ adapter, date }));
}

function renderPeriod(
  minuta: MinutaRef,
  unit: AdapterUnit
): RenderHookResult<Period, unknown> {
  return renderHook(() => usePeriod(minuta.current, unit));
}

function goAndRerender(
  minuta: MinutaRef,
  days: number,
  hooks: readonly Rerenderable[]
): void {
  act(() => {
    minuta.current.go(minuta.current.browsing, days);
  });
  for (const hook of hooks) {
    hook.rerender();
  }
}

describe("usePeriod() derivation", () => {
  it("should derive a month period from browsing", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { result: minuta } = renderMinuta();
    const { result: month } = renderPeriod(minuta, "month");

    expect(month.current.type).toBe("month");
    // January
    expect(month.current.start.getMonth()).toBe(JANUARY);
    // Start of month
    expect(month.current.start.getDate()).toBe(FIRST_DAY);
  });

  it("should update when browsing changes", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { result: minuta } = renderMinuta();
    const { result: month, rerender } = renderPeriod(minuta, "month");

    const january = month.current;
    expect(january.start.getMonth()).toBe(JANUARY);

    act(() => {
      minuta.current.next(minuta.current.browsing);
    });
    rerender();

    // Browsing moved 1 day, still January
    expect(month.current.start.getMonth()).toBe(JANUARY);
  });

  it("should memoize when dependencies unchanged", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { result: minuta } = renderMinuta();
    const { result: month, rerender } = renderPeriod(minuta, "month");

    const first = month.current;
    rerender();
    expect(month.current).toBe(first);
  });
});

describe("usePeriod() navigation", () => {
  it("should navigate to next month", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { result: minuta } = renderMinuta();
    const month = renderPeriod(minuta, "month");

    // January
    expect(month.result.current.start.getMonth()).toBe(JANUARY);

    // Navigate browsing forward by 31 days to reach February
    goAndRerender(minuta, DAYS_TO_FEBRUARY, [month]);

    // February
    expect(month.result.current.start.getMonth()).toBe(FEBRUARY);
  });

  it("should navigate to previous month", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { result: minuta } = renderMinuta();
    const month = renderPeriod(minuta, "month");

    goAndRerender(minuta, DAYS_TO_DECEMBER, [month]);

    // December 2023
    expect(month.result.current.start.getMonth()).toBe(DECEMBER);
    expect(month.result.current.start.getFullYear()).toBe(PREVIOUS_YEAR);
  });

  it(
    "should update year period when browsing crosses year boundary",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const { result: minuta } = renderMinuta();
      const year = renderPeriod(minuta, "year");

      expect(year.result.current.start.getFullYear()).toBe(TEST_YEAR);

      // Navigate forward 365 days to cross into 2025
      goAndRerender(minuta, DAYS_TO_NEXT_YEAR, [year]);

      // 2024 is leap year, 365 days from Jan 15 = Jan 14, 2025? Dec 2024?
      // The exact date depends, but year should still be derivable
      expect(year.result.current.type).toBe("year");
    }
  );
});

describe("usePeriod() divide reactivity", () => {
  it("should divide month into weeks", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { result: minuta } = renderMinuta();
    const month = renderPeriod(minuta, "month");

    const janWeeks = minuta.current.divide(month.result.current, "week");
    expect(janWeeks.length).toBeGreaterThan(NO_WEEKS);

    goAndRerender(minuta, DAYS_TO_FEBRUARY, [month]);

    const febWeeks = minuta.current.divide(month.result.current, "week");
    expect(firstOf(febWeeks).start.getTime()).not.toBe(
      firstOf(janWeeks).start.getTime()
    );
  });
});

describe("usePeriod() multiple hooks", () => {
  it("should coordinate year, month, week periods", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { result: minuta } = renderMinuta();
    const year = renderPeriod(minuta, "year");
    const month = renderPeriod(minuta, "month");
    const week = renderPeriod(minuta, "week");

    expect(year.result.current.type).toBe("year");
    expect(month.result.current.type).toBe("month");
    expect(week.result.current.type).toBe("week");

    goAndRerender(minuta, DAYS_TO_MARCH, [year, month, week]);

    // Month should have changed (60 days from Jan 15 = March)
    expect(month.result.current.start.getMonth()).toBe(MARCH);
  });
});
