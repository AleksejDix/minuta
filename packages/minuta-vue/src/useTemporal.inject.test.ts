import { describe, it, expect, beforeEach, vi } from "vitest";
import { ref } from "vue";
import type { TemporalBuilder } from "./types";
import { createTemporal } from "./createTemporal";
import { useTemporal } from "./useTemporal";
import { createNativeAdapter } from "minuta/native";

type VueModule = typeof import("vue");

const context = new Map<symbol, TemporalBuilder>();
let hasInstance = false;

vi.mock("vue", async () => {
  const actual = (await vi.importActual<VueModule>("vue")) as VueModule;
  return {
    ...actual,
    getCurrentInstance: () => (hasInstance ? {} : null),
    provide: (key: symbol, value: TemporalBuilder) => {
      context.set(key, value);
    },
    inject: (key: symbol) => context.get(key),
  };
});

describe("useTemporal injector", () => {
  const adapter = createNativeAdapter();

  beforeEach(() => {
    context.clear();
    hasInstance = false;
  });

  it("injects the nearest provided temporal instance", () => {
    hasInstance = true;
    const provided = createTemporal({
      date: ref(new Date(2024, 0, 1)),
      adapter,
    });
    const injected = useTemporal();
    expect(injected).toBe(provided);
  });

  it("throws a helpful error when no provider exists", () => {
    context.clear();
    expect(() => useTemporal()).toThrow("No temporal instance provided");
  });
});
