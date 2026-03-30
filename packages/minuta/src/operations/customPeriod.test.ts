import { describe, it, expect } from "vitest";
import { createPeriod } from "./period";
import { go } from "./go";
import { createNativeAdapter } from "../adapters/native";

describe("go() with custom periods", () => {
  const adapter = createNativeAdapter();
  const tenDays = createPeriod(
    new Date(2024, 0, 1),
    new Date(2024, 0, 10, 23, 59, 59, 999)
  );

  it("shifts forward by 1 step", () => {
    const shifted = go(adapter, tenDays, 1);
    expect(shifted.start.getTime()).toBe(tenDays.end.getTime() + 1);
  });

  it("preserves duration", () => {
    const shifted = go(adapter, tenDays, 1);
    const originalMs = tenDays.end.getTime() - tenDays.start.getTime();
    const shiftedMs = shifted.end.getTime() - shifted.start.getTime();
    expect(shiftedMs).toBe(originalMs);
  });

  it("shifts backward by 1 step", () => {
    const shifted = go(adapter, tenDays, -1);
    expect(shifted.end.getTime()).toBe(tenDays.start.getTime() - 1);
  });

  it("shifts by multiple steps", () => {
    const shifted = go(adapter, tenDays, 3);
    const durationMs = tenDays.end.getTime() - tenDays.start.getTime() + 1;
    expect(shifted.start.getTime()).toBe(
      tenDays.start.getTime() + durationMs * 3
    );
  });

  it("preserves type", () => {
    expect(go(adapter, tenDays, 1).type).toBe("custom");
  });

  it("zero steps returns same period", () => {
    const shifted = go(adapter, tenDays, 0);
    expect(shifted.start.getTime()).toBe(tenDays.start.getTime());
    expect(shifted.end.getTime()).toBe(tenDays.end.getTime());
  });
});
