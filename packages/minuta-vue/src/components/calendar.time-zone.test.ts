import {
  CalendarGrid,
  CalendarHeader,
  CalendarRoot,
} from "#src/components/index";
import { describe, expect, it } from "vitest";
import type { VNode } from "vue";
import { dateFnsTzUnits } from "minuta/date-fns-tz";
import { h } from "vue";
import { mountRender } from "#src/test/mount";

const MARCH_DAYS = 31;
const FIRST_DAY = 1;
const MARCH_NUMBERS: readonly string[] = Array.from(
  { length: MARCH_DAYS },
  (_unused, index) => String(index + FIRST_DAY)
);
// UTC+14: far from every runtime zone the tests run in
const units = dateFnsTzUnits({ timeZone: "Pacific/Kiritimati" });

describe("calendar parts with time-zone units", () => {
  it("numbers the days in the units' time zone", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const props = { date: new Date("2026-03-15T00:00:00Z"), units };
    const { element } = mountRender(() =>
      h(CalendarRoot, props, {
        default: (): VNode[] => [h(CalendarHeader), h(CalendarGrid)],
      })
    );
    const numbers = [
      ...element.querySelectorAll<HTMLElement>(
        ".calendar-day:not(.is-outside)"
      ),
    ].map((cell) => cell.textContent.trim());
    expect(numbers).toStrictEqual(MARCH_NUMBERS);
    expect(element.querySelector("h2")).toHaveProperty(
      "textContent",
      "March 2026"
    );
  });
});
