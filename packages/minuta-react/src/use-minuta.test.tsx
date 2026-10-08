import { describe, expect, it, vi } from "vitest";
import type { Adapter } from "minuta";
import type { MinutaBuilder } from "./types";
import type { RenderHookResult } from "@testing-library/react";
import { createNativeAdapter } from "minuta/native";
import { renderHook } from "@testing-library/react";
import { useMinuta } from "./use-minuta";

const DEFAULT_WEEK_START = 1;
const MS_PER_SECOND = 1000;

function createTestDate(): Date {
  return new Date("2024-01-15T12:30:45");
}

function silence(): void {
  // Expected errors are asserted, not printed
}

function preventReport(event: Event): void {
  event.preventDefault();
}

function suppressErrorOutput(run: () => void): void {
  const consoleError = vi.spyOn(console, "error").mockImplementation(silence);
  // An unhandled window error event is printed to stderr by jsdom
  globalThis.addEventListener("error", preventReport);
  try {
    run();
  } finally {
    globalThis.removeEventListener("error", preventReport);
    consoleError.mockRestore();
  }
}

function renderUntyped(options: Readonly<Record<string, unknown>>): void {
  renderHook(() => {
    Reflect.apply(useMinuta, undefined, [options]);
  });
}

function renderMinuta(
  adapter: Readonly<Adapter>,
  date: Readonly<Date>
): RenderHookResult<MinutaBuilder, unknown> {
  return renderHook(() => useMinuta({ adapter, date }));
}

describe("useMinuta() factory validation", () => {
  it(
    "should throw error when adapter is not provided",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const options = { date: createTestDate() };

      suppressErrorOutput(() => {
        expect(() => {
          renderUntyped(options);
        }).toThrow(
          "A date adapter is required. Please install and provide an adapter from minuta/* packages."
        );
      });
    }
  );

  it("should throw error when adapter is null", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const options = { adapter: null, date: createTestDate() };

    suppressErrorOutput(() => {
      expect(() => {
        renderUntyped(options);
      }).toThrow("A date adapter is required");
    });
  });

  it("should throw error when adapter is undefined", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const options = { adapter: undefined, date: createTestDate() };

    suppressErrorOutput(() => {
      expect(() => {
        renderUntyped(options);
      }).toThrow("A date adapter is required");
    });
  });
});

describe("useMinuta() basic initialization", () => {
  it("should create minuta with required options", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const adapter = createNativeAdapter();
    const { result } = renderMinuta(adapter, createTestDate());

    expect(result.current).toBeDefined();
    expect(result.current.adapter).toBe(adapter);
    // Default Monday
    expect(result.current.weekStartsOn).toBe(DEFAULT_WEEK_START);
    expect(result.current.browsing).toBeDefined();
    expect(result.current.now).toBeDefined();
  });

  it("should accept custom weekStartsOn values", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const adapter = createNativeAdapter();
    const date = createTestDate();

    for (const day of Array.from({ length: 7 }).keys()) {
      const { result } = renderHook(() =>
        useMinuta({ adapter, date, weekStartsOn: day })
      );
      expect(result.current.weekStartsOn).toBe(day);
    }
  });

  it("should use provided now date", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const adapter = createNativeAdapter();
    const nowDate = new Date("2024-01-20T10:00:00");
    const { result } = renderHook(() =>
      useMinuta({ adapter, date: createTestDate(), now: nowDate })
    );

    expect(result.current.now.start.getSeconds()).toBe(nowDate.getSeconds());
  });
});

describe("useMinuta() default now", () => {
  it(
    "should default now to current date when not provided",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const beforeCreate = new Date();
      const { result } = renderMinuta(createNativeAdapter(), createTestDate());
      const afterCreate = new Date();

      const nowTime = result.current.now.start.getTime();
      // The now.start is startOf(now, "second"), truncated to second boundary
      expect(nowTime).toBeGreaterThanOrEqual(
        beforeCreate.getTime() - MS_PER_SECOND
      );
      expect(nowTime).toBeLessThanOrEqual(afterCreate.getTime());
    }
  );
});

describe("useMinuta() browsing period", () => {
  it("should create browsing period with day unit", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const testDate = createTestDate();
    const { result } = renderMinuta(createNativeAdapter(), testDate);

    expect(result.current.browsing.type).toBe("day");
    expect(result.current.browsing.start.getDate()).toBe(testDate.getDate());
  });

  it("should create now period with second unit", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { result } = renderMinuta(createNativeAdapter(), createTestDate());

    expect(result.current.now.type).toBe("second");
  });
});
