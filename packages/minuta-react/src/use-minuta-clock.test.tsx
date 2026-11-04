import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { at, date } from "./test-temporal";
import { act } from "react";
import { createUnits } from "@aleksejdix/minuta/core";
import { renderHook } from "@testing-library/react";
import { useMinuta } from "./use-minuta";

const ZONE = "Europe/Zurich";
const BEFORE_MIDNIGHT = at("2026-03-18T22:59:59Z", ZONE);
const NEXT_DAY = date("2026-03-19");
const units = createUnits({ timeZone: ZONE });
const TWO_SECONDS = 2000;
const NO_TIMERS = 0;

describe("useMinuta() clock", () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: BEFORE_MIDNIGHT.epochMilliseconds });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("moves today to the new day after midnight", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { result } = renderHook(() => useMinuta({ units }));
    act(() => {
      vi.advanceTimersByTime(TWO_SECONDS);
    });
    const tomorrow = result.current.period(NEXT_DAY, "day");
    expect(result.current.contains(tomorrow, result.current.now.start)).toBe(
      true
    );
  });

  it("keeps a controlled now and sets no timer", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { result } = renderHook(() =>
      useMinuta({ now: BEFORE_MIDNIGHT, units })
    );
    expect(vi.getTimerCount()).toBe(NO_TIMERS);
    expect(result.current.now.start.toString()).toBe(
      BEFORE_MIDNIGHT.toString()
    );
  });

  it("clears its timer on unmount", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { unmount } = renderHook(() => useMinuta({ units }));
    unmount();
    expect(vi.getTimerCount()).toBe(NO_TIMERS);
  });
});
