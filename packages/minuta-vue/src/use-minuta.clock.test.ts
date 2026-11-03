import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MinutaState } from "#src/types";
import { effectScope } from "vue";
import { temporalUnits } from "@aleksejdix/minuta/temporal";
import { useMinuta } from "./use-minuta";
import { zoned } from "#src/test/temporal";

const BEFORE_MIDNIGHT = zoned("2026-03-18T23:59:59[Europe/Zurich]");
const NEXT_DAY = zoned("2026-03-19T12:00[Europe/Zurich]");
const TWO_SECONDS = 2000;
const NO_TIMERS = 0;
const units = temporalUnits({ timeZone: "Europe/Zurich" });

/**
 * Run useMinuta() in an effect scope, like a component would.
 *
 * @returns The state and a function that stops the scope
 */
function scopedMinuta(): Readonly<{ minuta: MinutaState; stop: () => void }> {
  const scope = effectScope();
  const minuta = scope.run(() => useMinuta({ units }));
  if (minuta === undefined) {
    throw new Error("The effect scope did not run");
  }
  return {
    minuta,
    stop: () => {
      scope.stop();
    },
  };
}

describe("useMinuta() clock", () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: BEFORE_MIDNIGHT.epochMilliseconds });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("moves today to the new day after midnight", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { minuta, stop } = scopedMinuta();
    vi.advanceTimersByTime(TWO_SECONDS);
    const tomorrow = minuta.period(NEXT_DAY, "day");
    expect(minuta.contains(tomorrow, minuta.now.value.start)).toBe(true);
    stop();
  });

  it("keeps a controlled now and sets no timer", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const minuta = useMinuta({ now: BEFORE_MIDNIGHT });
    expect(vi.getTimerCount()).toBe(NO_TIMERS);
    expect(minuta.now.value.start).toStrictEqual(BEFORE_MIDNIGHT);
  });

  it("clears its timer when the scope stops", { timeout: 5000 }, () => {
    expect.hasAssertions();
    scopedMinuta().stop();
    expect(vi.getTimerCount()).toBe(NO_TIMERS);
  });
});
