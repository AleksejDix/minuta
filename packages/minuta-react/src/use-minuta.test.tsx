import type { MinutaOptions, MinutaState } from "./types";
import { createUnits, withUnits } from "@aleksejdix/minuta/core";
import { describe, expect, it } from "vitest";
import { now, zoned } from "./test-temporal";
import type { RenderHookResult } from "@testing-library/react";
import { renderHook } from "@testing-library/react";
import { useMinuta } from "./use-minuta";

const MONDAY = 1;
const SUNDAY = 0;
const MS_PER_SECOND = 1000;
const FIFTEEN = 15;
const WEEK = 7;

function createTestDate(): ReturnType<typeof zoned> {
  return zoned("2024-01-15T12:30:45[Europe/Zurich]");
}

function renderMinuta(
  options: MinutaOptions
): RenderHookResult<MinutaState, unknown> {
  return renderHook(() => useMinuta(options));
}

describe("useMinuta() operations", () => {
  it("should expose the operations of withUnits", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const units = createUnits();
    const expected = withUnits(units);
    const { result } = renderMinuta({ date: createTestDate(), units });
    const month = expected.period(createTestDate(), "month");

    expect(Object.keys(result.current)).toStrictEqual(
      expect.arrayContaining(Object.keys(expected))
    );
    expect(result.current.contains).toBe(expected.contains);
    expect(result.current.next(month)).toStrictEqual(expected.next(month));
    expect(result.current.divide(month, "week")).toStrictEqual(
      expected.divide(month, "week")
    );
  });

  it(
    "should default to Temporal units with Monday weeks",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const { result } = renderMinuta({ date: createTestDate() });

      const week = result.current.period(createTestDate(), "week");
      expect(week.start.dayOfWeek).toBe(MONDAY);
    }
  );

  it("should bind the given units", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const units = createUnits({ weekStartsOn: SUNDAY });
    const { result } = renderMinuta({ date: createTestDate(), units });

    expect(result.current.units).toBe(units);
    const week = result.current.period(createTestDate(), "week");
    expect(week.start.dayOfWeek % WEEK).toBe(SUNDAY);
  });
});

describe("useMinuta() browsing period", () => {
  it(
    "should browse the month of the date by default",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const { result } = renderMinuta({ date: createTestDate() });

      expect(result.current.browsing).toStrictEqual(
        withUnits(createUnits()).period(createTestDate(), "month")
      );
    }
  );

  it("should browse the period of the given unit", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const testDate = createTestDate();
    const { result } = renderMinuta({ date: testDate, unit: "day" });

    expect(result.current.browsing.unit).toBe("day");
    expect(result.current.browsing.start.day).toBe(FIFTEEN);
    expect(result.current.browsing.start.toString()).toBe(
      testDate.toPlainDate().toString()
    );
  });

  it("should default the browsed date to now", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { result } = renderMinuta({});

    expect(result.current.contains(result.current.browsing, now())).toBe(true);
  });
});

describe("useMinuta() now period", () => {
  it("should use provided now date", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const nowDate = zoned("2024-01-20T10:00:00[Europe/Zurich]");
    const { result } = renderMinuta({ date: createTestDate(), now: nowDate });

    expect(result.current.now.start.toString()).toBe(nowDate.toString());
  });

  it("should create now period with second unit", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { result } = renderMinuta({ date: createTestDate() });

    expect(result.current.now.unit).toBe("second");
  });

  it(
    "should default now to current date when not provided",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const beforeCreate = Date.now();
      const { result } = renderMinuta({ date: createTestDate() });
      const afterCreate = Date.now();

      const nowTime = result.current.now.start.epochMilliseconds;
      // The now.start is the start of now's second
      expect(nowTime).toBeGreaterThanOrEqual(beforeCreate - MS_PER_SECOND);
      expect(nowTime).toBeLessThanOrEqual(afterCreate);
    }
  );
});
