import type { Unit, Units } from "minuta/core";
import { describe, expect, it } from "vitest";
import { nativeUnits } from "minuta/native";
import { renderHook } from "@testing-library/react";
import { useMinuta } from "./use-minuta";

type Props = Readonly<{ unit: Unit; units: Units }>;

const SUNDAY = 0;

function createTestDate(): Date {
  return new Date("2024-01-15T12:30:45");
}

function renderWithProps(
  initialProps: Props
): ReturnType<typeof renderHook<ReturnType<typeof useMinuta>, Props>> {
  const date = createTestDate();
  return renderHook(
    ({ unit, units }: Props) => useMinuta({ date, unit, units }),
    {
      initialProps,
    }
  );
}

describe("useMinuta() memoization", () => {
  it(
    "should keep the same state when nothing changes",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const units = nativeUnits();
      const { result, rerender } = renderWithProps({ unit: "month", units });
      const first = result.current;

      rerender({ unit: "month", units });

      expect(result.current).toBe(first);
    }
  );

  it(
    "should rebind and update browsing when units change",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const { result, rerender } = renderWithProps({
        unit: "week",
        units: nativeUnits(),
      });
      const initial = result.current;
      const sundayUnits = nativeUnits({ weekStartsOn: SUNDAY });

      rerender({ unit: "week", units: sundayUnits });

      expect(result.current.units).toBe(sundayUnits);
      expect(result.current.next).not.toBe(initial.next);
      expect(result.current.browsing.start.getDay()).toBe(SUNDAY);
    }
  );

  it("should update browsing when the unit changes", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const units = nativeUnits();
    const { result, rerender } = renderWithProps({ unit: "month", units });

    rerender({ unit: "year", units });

    expect(result.current.browsing.unit).toBe("year");
  });
});
