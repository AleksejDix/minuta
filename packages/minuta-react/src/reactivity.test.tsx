import type { JSX, ReactNode } from "react";
import type { MinutaState, Period, Unit } from "./types";
import { describe, expect, it } from "vitest";
import { MinutaRoot } from "./minuta-root";
import type { RenderHookResult } from "@testing-library/react";
import { act } from "react";
import { renderHook } from "@testing-library/react";
import { useMinutaContext } from "./minuta-context";
import { usePeriod } from "./use-period";

type Hooks = Readonly<{
  minuta: MinutaState;
  period: Period;
}>;

type MinutaRef = Readonly<{ current: Hooks }>;

const JANUARY = 0;
const FEBRUARY = 1;
const MARCH = 2;
const DECEMBER = 11;
const FIRST_DAY = 1;
const PREVIOUS_YEAR = 2023;
const TEST_YEAR = 2024;
const NEXT_YEAR = 2025;
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

// oxlint-disable-next-line typescript/prefer-readonly-parameter-types -- ReactNode contains ReactElement<any>, which cannot be deeply readonly
function DayRoot({ children }: Readonly<{ children: ReactNode }>): JSX.Element {
  return (
    <MinutaRoot date={new Date("2024-01-15T00:00:00")} unit="day">
      {children}
    </MinutaRoot>
  );
}

function renderPeriod(unit: Unit): RenderHookResult<Hooks, unknown> {
  return renderHook(
    () => ({ minuta: useMinutaContext(), period: usePeriod(unit) }),
    { wrapper: DayRoot }
  );
}

function shiftBrowsing(hooks: MinutaRef, days: number): void {
  act(() => {
    const { minuta } = hooks.current;
    minuta.browse(minuta.shift(minuta.browsing, days));
  });
}

describe("usePeriod() derivation", () => {
  it("should derive a month period from browsing", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { result } = renderPeriod("month");

    expect(result.current.period.unit).toBe("month");
    expect(result.current.period.start.getMonth()).toBe(JANUARY);
    expect(result.current.period.start.getDate()).toBe(FIRST_DAY);
  });

  it("should update when browsing changes", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { result } = renderPeriod("month");
    const january = result.current.period;

    act(() => {
      const { minuta } = result.current;
      minuta.browse(minuta.next(minuta.browsing));
    });

    // Browsing moved 1 day, still January
    expect(result.current.period).toStrictEqual(january);
  });

  it("should memoize when dependencies unchanged", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { result, rerender } = renderPeriod("month");
    const first = result.current.period;

    rerender();

    expect(result.current.period).toBe(first);
  });
});

describe("usePeriod() navigation", () => {
  it("should navigate to next month", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { result } = renderPeriod("month");

    shiftBrowsing(result, DAYS_TO_FEBRUARY);

    expect(result.current.period.start.getMonth()).toBe(FEBRUARY);
  });

  it("should navigate to previous month", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { result } = renderPeriod("month");

    shiftBrowsing(result, DAYS_TO_DECEMBER);

    expect(result.current.period.start.getMonth()).toBe(DECEMBER);
    expect(result.current.period.start.getFullYear()).toBe(PREVIOUS_YEAR);
  });

  it(
    "should update year period when browsing crosses year boundary",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const { result } = renderPeriod("year");
      expect(result.current.period.start.getFullYear()).toBe(TEST_YEAR);

      shiftBrowsing(result, DAYS_TO_NEXT_YEAR);

      expect(result.current.period.start.getFullYear()).toBe(NEXT_YEAR);
    }
  );
});

describe("usePeriod() divide reactivity", () => {
  it("should divide month into weeks", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { result } = renderPeriod("month");
    const janWeeks = result.current.minuta.divide(
      result.current.period,
      "week"
    );
    expect(janWeeks.length).toBeGreaterThan(NO_WEEKS);

    shiftBrowsing(result, DAYS_TO_FEBRUARY);

    const febWeeks = result.current.minuta.divide(
      result.current.period,
      "week"
    );
    expect(firstOf(febWeeks).start.getTime()).not.toBe(
      firstOf(janWeeks).start.getTime()
    );
  });
});

describe("usePeriod() multiple hooks", () => {
  it("should coordinate year, month, week periods", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { result } = renderHook(
      () => ({
        minuta: useMinutaContext(),
        month: usePeriod("month"),
        week: usePeriod("week"),
        year: usePeriod("year"),
      }),
      { wrapper: DayRoot }
    );
    expect(result.current.year.unit).toBe("year");
    expect(result.current.month.unit).toBe("month");
    expect(result.current.week.unit).toBe("week");

    act(() => {
      const { minuta } = result.current;
      minuta.browse(minuta.shift(minuta.browsing, DAYS_TO_MARCH));
    });

    // 60 days from Jan 15 = March
    expect(result.current.month.start.getMonth()).toBe(MARCH);
  });
});
