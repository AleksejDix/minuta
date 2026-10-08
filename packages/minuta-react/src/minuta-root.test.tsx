import type { JSX, ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { MinutaRoot } from "./minuta-root";
import { nativeUnits } from "minuta/native";
import { renderHook } from "@testing-library/react";
import { useMinutaContext } from "./minuta-context";
import { withUnits } from "minuta/core";

type WrapperProps = Readonly<{ children: ReactNode }>;

const SUNDAY = 0;
const UNITS = nativeUnits({ weekStartsOn: SUNDAY });

function createTestDate(): Date {
  return new Date("2024-01-15T12:30:45");
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
      expect(result.current.browsing.start.getDay()).toBe(SUNDAY);
    }
  );
});
