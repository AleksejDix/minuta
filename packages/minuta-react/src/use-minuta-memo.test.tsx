import type { Unit, Units, ZonedDateTime } from "@aleksejdix/minuta/core";
import { describe, expect, it } from "vitest";
import { createUnits } from "@aleksejdix/minuta/core";
import { renderHook } from "@testing-library/react";
import { useMinuta } from "./use-minuta";
import { zoned } from "./test-temporal";

type Props = Readonly<{ unit: Unit; units: Units }>;

const SUNDAY = 0;
const WEEK = 7;

function createTestDate(): ZonedDateTime {
  return zoned("2024-01-15T12:30:45[Europe/Zurich]");
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
      const units = createUnits();
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
        units: createUnits(),
      });
      const initial = result.current;
      const sundayUnits = createUnits({ weekStartsOn: SUNDAY });

      rerender({ unit: "week", units: sundayUnits });

      expect(result.current.units).toBe(sundayUnits);
      expect(result.current.next).not.toBe(initial.next);
      expect(result.current.browsing.start.dayOfWeek % WEEK).toBe(SUNDAY);
    }
  );

  it("should update browsing when the unit changes", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const units = createUnits();
    const { result, rerender } = renderWithProps({ unit: "month", units });

    rerender({ unit: "year", units });

    expect(result.current.browsing.unit).toBe("year");
  });
});
