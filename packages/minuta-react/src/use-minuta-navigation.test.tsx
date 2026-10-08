import { describe, expect, it } from "vitest";
import type { MinutaBuilder } from "./types";
import type { RenderHookResult } from "@testing-library/react";
import { act } from "react";
import { createNativeAdapter } from "minuta/native";
import { renderHook } from "@testing-library/react";
import { useMinuta } from "./use-minuta";

const GO_STEPS = 5;
const NEXT_COUNT = 3;
const PREVIOUS_COUNT = 2;
const FEBRUARY = 1;
const NEXT_YEAR = 2025;

function renderMinuta(): RenderHookResult<MinutaBuilder, unknown> {
  const adapter = createNativeAdapter();
  const date = new Date("2024-01-15T12:30:45");
  return renderHook(() => useMinuta({ adapter, date }));
}

describe("useMinuta() single-step navigation", () => {
  it("should navigate to next period", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { result } = renderMinuta();
    const initialBrowsing = result.current.browsing;

    act(() => {
      result.current.next(result.current.browsing);
    });

    expect(result.current.browsing.start.getTime()).not.toBe(
      initialBrowsing.start.getTime()
    );
    expect(result.current.browsing.start.getTime()).toBeGreaterThan(
      initialBrowsing.start.getTime()
    );
  });

  it("should navigate to previous period", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { result } = renderMinuta();
    const initialBrowsing = result.current.browsing;

    act(() => {
      result.current.previous(result.current.browsing);
    });

    expect(result.current.browsing.start.getTime()).not.toBe(
      initialBrowsing.start.getTime()
    );
    expect(result.current.browsing.start.getTime()).toBeLessThan(
      initialBrowsing.start.getTime()
    );
  });

  it("should navigate with go method", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { result } = renderMinuta();
    const initialBrowsing = result.current.browsing;

    act(() => {
      result.current.go(result.current.browsing, GO_STEPS);
    });

    expect(result.current.browsing.start.getTime()).not.toBe(
      initialBrowsing.start.getTime()
    );
  });
});

describe("useMinuta() multi-step navigation", () => {
  it(
    "should navigate multiple periods with next count",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const { result } = renderMinuta();
      const initialBrowsing = result.current.browsing;

      act(() => {
        result.current.next(result.current.browsing, NEXT_COUNT);
      });

      expect(result.current.browsing.start.getTime()).not.toBe(
        initialBrowsing.start.getTime()
      );
    }
  );

  it(
    "should navigate multiple periods with previous count",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const { result } = renderMinuta();
      const initialBrowsing = result.current.browsing;

      act(() => {
        result.current.previous(result.current.browsing, PREVIOUS_COUNT);
      });

      expect(result.current.browsing.start.getTime()).not.toBe(
        initialBrowsing.start.getTime()
      );
    }
  );
});

describe("useMinuta() navigating another period", () => {
  it(
    "should update browsing when navigating non-browsing period",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const { result } = renderMinuta();
      const otherPeriod = result.current.derivePeriod(
        new Date("2025-01-01T00:00:00"),
        "month"
      );
      const initialBrowsing = result.current.browsing;

      act(() => {
        result.current.next(otherPeriod);
      });

      expect(result.current.browsing).not.toStrictEqual(initialBrowsing);
      expect(result.current.browsing.start.getMonth()).toBe(FEBRUARY);
      expect(result.current.browsing.start.getFullYear()).toBe(NEXT_YEAR);
    }
  );
});
