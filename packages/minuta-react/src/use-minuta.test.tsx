import type { MinutaOptions, MinutaState } from "./types";
import { describe, expect, it } from "vitest";
import type { RenderHookResult } from "@testing-library/react";
import { nativeUnits } from "minuta/native";
import { renderHook } from "@testing-library/react";
import { useMinuta } from "./use-minuta";
import { withUnits } from "minuta/core";

const MONDAY = 1;
const SUNDAY = 0;
const MS_PER_SECOND = 1000;

function createTestDate(): Date {
  return new Date("2024-01-15T12:30:45");
}

function renderMinuta(
  options: MinutaOptions
): RenderHookResult<MinutaState, unknown> {
  return renderHook(() => useMinuta(options));
}

describe("useMinuta() operations", () => {
  it("should expose the operations of withUnits", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const units = nativeUnits();
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
    "should default to native units with Monday weeks",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const { result } = renderMinuta({ date: createTestDate() });

      const week = result.current.period(createTestDate(), "week");
      expect(week.start.getDay()).toBe(MONDAY);
    }
  );

  it("should bind the given units", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const units = nativeUnits({ weekStartsOn: SUNDAY });
    const { result } = renderMinuta({ date: createTestDate(), units });

    expect(result.current.units).toBe(units);
    expect(result.current.period(createTestDate(), "week").start.getDay()).toBe(
      SUNDAY
    );
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
        withUnits(nativeUnits()).period(createTestDate(), "month")
      );
    }
  );

  it("should browse the period of the given unit", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const testDate = createTestDate();
    const { result } = renderMinuta({ date: testDate, unit: "day" });

    expect(result.current.browsing.unit).toBe("day");
    expect(result.current.browsing.start.getDate()).toBe(testDate.getDate());
  });

  it("should default the browsed date to now", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { result } = renderMinuta({});

    expect(result.current.contains(result.current.browsing, new Date())).toBe(
      true
    );
  });
});

describe("useMinuta() now period", () => {
  it("should use provided now date", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const nowDate = new Date("2024-01-20T10:00:00");
    const { result } = renderMinuta({ date: createTestDate(), now: nowDate });

    expect(result.current.now.start).toStrictEqual(nowDate);
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
      const beforeCreate = new Date();
      const { result } = renderMinuta({ date: createTestDate() });
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
