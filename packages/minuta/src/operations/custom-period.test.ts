import { describe, expect, it } from "vitest";
import { createNativeAdapter } from "#src/adapters/native/index";
import { createPeriod } from "./period";
import { go } from "./go";

const ONE_MS = 1;
const ONE_STEP = 1;
const ONE_STEP_BACK = -1;
const THREE_STEPS = 3;
const NO_STEPS = 0;

describe("go() with custom periods", () => {
  const adapter = createNativeAdapter();
  const tenDays = createPeriod(
    new Date("2024-01-01T00:00"),
    new Date("2024-01-10T23:59:59.999")
  );

  it("shifts forward by 1 step", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const shifted = go(adapter, tenDays, ONE_STEP);
    expect(shifted.start.getTime()).toBe(tenDays.end.getTime() + ONE_MS);
  });

  it("preserves duration", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const shifted = go(adapter, tenDays, ONE_STEP);
    const originalMs = tenDays.end.getTime() - tenDays.start.getTime();
    const shiftedMs = shifted.end.getTime() - shifted.start.getTime();
    expect(shiftedMs).toBe(originalMs);
  });

  it("shifts backward by 1 step", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const shifted = go(adapter, tenDays, ONE_STEP_BACK);
    expect(shifted.end.getTime()).toBe(tenDays.start.getTime() - ONE_MS);
  });

  it("shifts by multiple steps", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const shifted = go(adapter, tenDays, THREE_STEPS);
    const durationMs = tenDays.end.getTime() - tenDays.start.getTime() + ONE_MS;
    expect(shifted.start.getTime()).toBe(
      tenDays.start.getTime() + durationMs * THREE_STEPS
    );
  });

  it("preserves type", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(go(adapter, tenDays, ONE_STEP).type).toBe("custom");
  });

  it("zero steps returns same period", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const shifted = go(adapter, tenDays, NO_STEPS);
    expect(shifted.start.getTime()).toBe(tenDays.start.getTime());
    expect(shifted.end.getTime()).toBe(tenDays.end.getTime());
  });
});
