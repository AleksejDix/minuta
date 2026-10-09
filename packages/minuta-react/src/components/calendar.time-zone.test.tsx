import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { CalendarGrid } from "./CalendarGrid";
import { CalendarHeader } from "./CalendarHeader";
import { CalendarRoot } from "./CalendarRoot";
import { dateFnsTzUnits } from "minuta/date-fns-tz";

const MARCH_DAYS = 31;
const FIRST_DAY = 1;
const MARCH_NUMBERS: readonly string[] = Array.from(
  { length: MARCH_DAYS },
  (_unused, index) => String(index + FIRST_DAY)
);
// UTC+14: far from every runtime zone the tests run in
const units = dateFnsTzUnits({ timeZone: "Pacific/Kiritimati" });

describe("calendar parts with time-zone units", () => {
  afterEach(cleanup);

  it("numbers the days in the units' time zone", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { container } = render(
      <CalendarRoot date={new Date("2026-03-15T00:00:00Z")} units={units}>
        <CalendarHeader />
        <CalendarGrid />
      </CalendarRoot>
    );
    const numbers = [
      ...container.querySelectorAll<HTMLElement>(
        ".day-cell:not(.is-outside) .date-number"
      ),
    ].map((cell) => cell.textContent);
    expect(numbers).toStrictEqual(MARCH_NUMBERS);
    expect(screen.getByRole("heading").textContent).toBe("March 2026");
  });
});
