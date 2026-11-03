import type { MinutaOptions, MinutaState } from "./types";
import { date, zoned } from "./test-temporal";
import { describe, expect, it } from "vitest";
import type { RenderHookResult } from "@testing-library/react";
import { act } from "react";
import { renderHook } from "@testing-library/react";
import { useMinuta } from "./use-minuta";

const SHIFT_STEPS = 5;
const LATER = 1;
const EARLIER = -1;
const FEBRUARY = 2;
const JUNE = 6;
const NEXT_YEAR = 2025;

function renderMinuta(
  options: MinutaOptions = {}
): RenderHookResult<MinutaState, unknown> {
  const browsed = zoned("2024-01-15T12:30:45[Europe/Zurich]");
  return renderHook(() => useMinuta({ date: browsed, unit: options.unit }));
}

describe("useMinuta() browse", () => {
  it("should browse to the next period", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { result } = renderMinuta();
    const initialBrowsing = result.current.browsing;

    act(() => {
      result.current.browse(result.current.next(result.current.browsing));
    });

    const before = initialBrowsing.start.toString();
    const after = result.current.browsing.start.toString();
    // ISO dates compare like the dates they write
    expect(Math.sign(after.localeCompare(before))).toBe(LATER);
    expect(result.current.browsing.start.month).toBe(FEBRUARY);
  });

  it("should browse to the previous period", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { result } = renderMinuta();
    const initialBrowsing = result.current.browsing;

    act(() => {
      result.current.browse(result.current.previous(result.current.browsing));
    });

    const before = initialBrowsing.start.toString();
    const after = result.current.browsing.start.toString();
    expect(Math.sign(after.localeCompare(before))).toBe(EARLIER);
  });
});

describe("useMinuta() browse with shift", () => {
  it("should browse to a shifted period", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { result } = renderMinuta();

    act(() => {
      result.current.browse(
        result.current.shift(result.current.browsing, SHIFT_STEPS)
      );
    });

    expect(result.current.browsing.start.month).toBe(JUNE);
  });

  it("should keep browse stable across renders", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { result } = renderMinuta();
    const { browse } = result.current;

    act(() => {
      browse(result.current.next(result.current.browsing));
    });

    expect(result.current.browse).toBe(browse);
  });
});

describe("useMinuta() browsing another period", () => {
  it(
    "should update browsing when browsing a non-browsing period",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const { result } = renderMinuta();
      const otherPeriod = result.current.period(date("2025-01-01"), "month");

      act(() => {
        result.current.browse(result.current.next(otherPeriod));
      });

      expect(result.current.browsing.start.month).toBe(FEBRUARY);
      expect(result.current.browsing.start.year).toBe(NEXT_YEAR);
    }
  );

  it(
    "should browse the period of the browsing unit containing the start",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const { result } = renderMinuta({ unit: "month" });
      const day = result.current.period(date("2024-03-20"), "day");

      act(() => {
        result.current.browse(day);
      });

      expect(result.current.browsing).toStrictEqual(
        result.current.period(day.start, "month")
      );
    }
  );
});
