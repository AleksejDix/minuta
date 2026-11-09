import type { JSX, ReactNode } from "react";
import { createUnits, withUnits } from "@aleksejdix/minuta";
import { describe, expect, it } from "vitest";
import { MinutaRoot } from "./minuta-root";
import type { ZonedDateTime } from "@aleksejdix/minuta";
import { renderHook } from "@testing-library/react";
import { useMinutaContext } from "./minuta-context";
import { zoned } from "./test-temporal";

type WrapperProps = Readonly<{ children: ReactNode }>;

const SUNDAY = 0;
const WEEK = 7;
const UNITS = createUnits({ weekStartsOn: SUNDAY });

function createTestDate(): ZonedDateTime {
  return zoned("2024-01-15T12:30:45[Europe/Zurich]");
}

// oxlint-disable-next-line typescript/prefer-readonly-parameter-types -- ReactNode contains ReactElement<any>, which cannot be deeply readonly
function WeekRoot({ children }: WrapperProps): JSX.Element {
  return (
    <MinutaRoot date={createTestDate()} unit="week" units={UNITS}>
      {children}
    </MinutaRoot>
  );
}

describe("<MinutaRoot>", () => {
  it(
    "should provide useMinuta(props) to its children",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const { result } = renderHook(() => useMinutaContext(), {
        wrapper: WeekRoot,
      });

      expect(result.current.units).toBe(UNITS);
      expect(result.current.browsing).toStrictEqual(
        withUnits(UNITS).period(createTestDate(), "week")
      );
      expect(result.current.browsing.start.dayOfWeek % WEEK).toBe(SUNDAY);
    }
  );
});
