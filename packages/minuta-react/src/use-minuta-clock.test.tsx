import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { renderHook } from "@testing-library/react";
import { useMinuta } from "./use-minuta";

const BEFORE_MIDNIGHT = new Date("2026-03-18T23:59:59");
const NEXT_DAY = new Date("2026-03-19T12:00");
const TWO_SECONDS = 2000;
const NO_TIMERS = 0;

describe("useMinuta() clock", () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: BEFORE_MIDNIGHT });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("moves today to the new day after midnight", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { result } = renderHook(() => useMinuta());
    act(() => {
      vi.advanceTimersByTime(TWO_SECONDS);
    });
    const tomorrow = result.current.period(NEXT_DAY, "day");
    expect(result.current.isToday(result.current.now.start, tomorrow)).toBe(
      true
    );
  });

  it("keeps a controlled now and sets no timer", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { result } = renderHook(() => useMinuta({ now: BEFORE_MIDNIGHT }));
    expect(vi.getTimerCount()).toBe(NO_TIMERS);
    expect(result.current.now.start).toStrictEqual(BEFORE_MIDNIGHT);
  });

  it("clears its timer on unmount", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { unmount } = renderHook(() => useMinuta());
    unmount();
    expect(vi.getTimerCount()).toBe(NO_TIMERS);
  });
});
