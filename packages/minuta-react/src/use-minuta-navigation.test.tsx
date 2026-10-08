import type { MinutaOptions, MinutaState } from "./types";
import { describe, expect, it } from "vitest";
import type { RenderHookResult } from "@testing-library/react";
import { act } from "react";
import { renderHook } from "@testing-library/react";
import { useMinuta } from "./use-minuta";

const SHIFT_STEPS = 5;
const FEBRUARY = 1;
const JUNE = 5;
const NEXT_YEAR = 2025;

function renderMinuta(
  options: MinutaOptions = {}
): RenderHookResult<MinutaState, unknown> {
  const date = new Date("2024-01-15T12:30:45");
  return renderHook(() => useMinuta({ date, unit: options.unit }));
}

describe("useMinuta() browse", () => {
  it("should browse to the next period", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { result } = renderMinuta();
    const initialBrowsing = result.current.browsing;

    act(() => {
      result.current.browse(result.current.next(result.current.browsing));
    });

    expect(result.current.browsing.start.getTime()).toBeGreaterThan(
      initialBrowsing.start.getTime()
    );
    expect(result.current.browsing.start.getMonth()).toBe(FEBRUARY);
  });

  it("should browse to the previous period", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { result } = renderMinuta();
    const initialBrowsing = result.current.browsing;

    act(() => {
      result.current.browse(result.current.previous(result.current.browsing));
    });

    expect(result.current.browsing.start.getTime()).toBeLessThan(
      initialBrowsing.start.getTime()
    );
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

    expect(result.current.browsing.start.getMonth()).toBe(JUNE);
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
      const otherPeriod = result.current.period(
        new Date("2025-01-01T00:00:00"),
        "month"
      );

      act(() => {
        result.current.browse(result.current.next(otherPeriod));
      });

      expect(result.current.browsing.start.getMonth()).toBe(FEBRUARY);
      expect(result.current.browsing.start.getFullYear()).toBe(NEXT_YEAR);
    }
  );

  it(
    "should browse the period of the browsing unit containing the start",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const { result } = renderMinuta({ unit: "month" });
      const day = result.current.period(new Date("2024-03-20T00:00:00"), "day");

      act(() => {
        result.current.browse(day);
      });

      expect(result.current.browsing).toStrictEqual(
        result.current.period(day.start, "month")
      );
    }
  );
});
