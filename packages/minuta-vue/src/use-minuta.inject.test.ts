import { describe, it, expect, beforeEach, vi } from "vitest";
import { ref } from "vue";
import type { MinutaBuilder } from "./types";
import { createMinuta } from "./create-minuta";
import { useMinuta } from "./use-minuta";
import { createNativeAdapter } from "minuta/native";

type VueModule = typeof import("vue");

const context = new Map<symbol, MinutaBuilder>();
let hasInstance = false;

vi.mock("vue", async () => {
  const actual = (await vi.importActual<VueModule>("vue")) as VueModule;
  return {
    ...actual,
    getCurrentInstance: () => (hasInstance ? {} : null),
    provide: (key: symbol, value: MinutaBuilder) => {
      context.set(key, value);
    },
    inject: (key: symbol) => context.get(key),
  };
});

describe("useMinuta injector", () => {
  const adapter = createNativeAdapter();

  beforeEach(() => {
    context.clear();
    hasInstance = false;
  });

  it("injects the nearest provided minuta instance", () => {
    hasInstance = true;
    const provided = createMinuta({
      date: ref(new Date(2024, 0, 1)),
      adapter,
    });
    const injected = useMinuta();
    expect(injected).toBe(provided);
  });

  it("throws a helpful error when no provider exists", () => {
    context.clear();
    expect(() => useMinuta()).toThrow("No minuta instance provided");
  });
});
