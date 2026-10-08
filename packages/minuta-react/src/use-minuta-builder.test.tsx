import { describe, expect, it } from "vitest";
import type { Adapter } from "minuta";
import type { MinutaBuilder } from "./types";
import type { RenderHookResult } from "@testing-library/react";
import { createNativeAdapter } from "minuta/native";
import { renderHook } from "@testing-library/react";
import { useMinuta } from "./use-minuta";

const MONTHS_PER_YEAR = 12;
const TEST_YEAR = 2024;
const MERGE_START = 0;
const MERGE_END = 3;

function createTestDate(): Date {
  return new Date("2024-01-15T12:30:45");
}

function firstOf<Item>(items: readonly Item[]): Item {
  const [first] = items;
  if (first === undefined) {
    throw new Error("Expected at least one item");
  }
  return first;
}

function renderMinuta(
  adapter: Readonly<Adapter> = createNativeAdapter()
): RenderHookResult<MinutaBuilder, unknown> {
  const date = createTestDate();
  return renderHook(() => useMinuta({ adapter, date }));
}

describe("useMinuta() builder methods", () => {
  it("should provide period method", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { result } = renderMinuta();

    const year = result.current.derivePeriod(createTestDate(), "year");
    expect(year.type).toBe("year");
    expect(year.start.getFullYear()).toBe(TEST_YEAR);
  });

  it("should provide divide method", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { result } = renderMinuta();

    const year = result.current.derivePeriod(createTestDate(), "year");
    const months = result.current.divide(year, "month");

    expect(months).toHaveLength(MONTHS_PER_YEAR);
    expect(firstOf(months).type).toBe("month");
  });

  it("should provide merge method", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { result } = renderMinuta();

    const year = result.current.derivePeriod(createTestDate(), "year");
    const months = result.current.divide(year, "month");
    const merged = result.current.merge(months.slice(MERGE_START, MERGE_END));

    expect(merged).toBeDefined();
    expect(merged.start).toStrictEqual(firstOf(months).start);
  });

  it("should support custom period creation", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { result } = renderMinuta();

    const start = new Date("2024-01-01T00:00:00");
    const end = new Date("2024-01-31T00:00:00");
    const customPeriod = result.current.createPeriod(start, end);

    expect(customPeriod.start).toStrictEqual(start);
    expect(customPeriod.end).toStrictEqual(end);
    expect(customPeriod.type).toBe("custom");
  });
});

describe("useMinuta() utility methods", () => {
  it("should provide split method", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { result } = renderMinuta();

    const year = result.current.derivePeriod(createTestDate(), "year");
    // June 1st
    const splitDate = new Date("2024-06-01T00:00:00");
    const [before, after] = result.current.split(year, splitDate);

    // Before period should end at or just before split date
    expect(before.end.getTime()).toBeLessThanOrEqual(splitDate.getTime());
    // After period should start at split date
    expect(after.start).toStrictEqual(splitDate);
    // Verify they cover the full year
    expect(before.start).toStrictEqual(year.start);
    expect(after.end).toStrictEqual(year.end);
  });

  it("should provide contains method", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { result } = renderMinuta();

    const month = result.current.derivePeriod(createTestDate(), "month");
    const dateInMonth = new Date("2024-01-20T00:00:00");
    const dateOutsideMonth = new Date("2024-02-01T00:00:00");

    expect(result.current.contains(month, dateInMonth)).toBe(true);
    expect(result.current.contains(month, dateOutsideMonth)).toBe(false);
  });

  it("should provide isSame method", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { result } = renderMinuta();

    const janDay = result.current.derivePeriod(
      new Date("2024-01-15T00:00:00"),
      "day"
    );
    const febDay = result.current.derivePeriod(
      new Date("2024-02-15T00:00:00"),
      "day"
    );

    expect(result.current.isSame(janDay, janDay, "month")).toBe(true);
    expect(result.current.isSame(janDay, febDay, "month")).toBe(false);
  });
});

describe("useMinuta() adapter memoization", () => {
  it("should update browsing when adapter changes", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const date = createTestDate();
    const { result, rerender } = renderHook(
      ({ adapter }: Readonly<{ adapter: Readonly<Adapter> }>) =>
        useMinuta({ adapter, date }),
      { initialProps: { adapter: createNativeAdapter() } }
    );

    const initialBrowsing = result.current.browsing;
    const newAdapter = createNativeAdapter();

    rerender({ adapter: newAdapter });

    // Browsing should be recreated with new adapter
    expect(result.current.adapter).toBe(newAdapter);
    expect(result.current.browsing).not.toBe(initialBrowsing);
  });
});
