import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMinuta } from "./create-minuta";
import { createNativeAdapter } from "minuta/native";
import { ref } from "vue";
import { useMinuta } from "./use-minuta";

const context = new Map<symbol, unknown>();
const instance = { active: false };

/**
 * Stands in for getCurrentInstance(): truthy only while a fake component is active.
 *
 * @returns A fake instance, or undefined outside a component
 */
function fakeCurrentInstance(): object | undefined {
  if (instance.active) {
    return {};
  }
  return undefined;
}

/**
 * Stands in for provide(): stores the value in the fake context.
 *
 * @param key - The injection key
 * @param value - The provided value
 */
function fakeProvide(key: symbol, value: unknown): void {
  context.set(key, value);
}

/**
 * Stands in for inject(): reads the value from the fake context.
 *
 * @param key - The injection key
 * @returns The provided value, if any
 */
function fakeInject(key: symbol): unknown {
  return context.get(key);
}

vi.mock(import("vue"), async (importOriginal) => {
  const mocked: Record<string, unknown> = {};
  return Object.assign(mocked, await importOriginal(), {
    getCurrentInstance: fakeCurrentInstance,
    inject: fakeInject,
    provide: fakeProvide,
  });
});

describe("useMinuta() injector", () => {
  const adapter = createNativeAdapter();

  beforeEach(() => {
    context.clear();
    instance.active = false;
  });

  it("injects the nearest provided minuta instance", { timeout: 5000 }, () => {
    expect.hasAssertions();
    instance.active = true;
    const provided = createMinuta({
      adapter,
      date: ref(new Date("2024-01-01T00:00:00")),
    });
    const injected = useMinuta();
    expect(injected).toBe(provided);
  });

  it(
    "throws a helpful error when no provider exists",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      context.clear();
      expect(() => useMinuta()).toThrow("No minuta instance provided");
    }
  );
});
