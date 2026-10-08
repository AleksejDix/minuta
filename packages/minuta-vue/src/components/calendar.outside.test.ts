import {
  CalendarDay,
  CalendarGrid,
  CalendarHeader,
  CalendarWeekdays,
} from "#src/components/index";
import { describe, expect, it } from "vitest";
import { mountRender, silenceVueWarnings } from "#src/test/mount";
import type { Period } from "minuta/core";
import { h } from "vue";

const OUTSIDE_CALENDAR = "Calendar parts must be used within <CalendarRoot>";

const testDate = new Date("2024-03-13T00:00:00");

describe("calendar parts outside CalendarRoot", () => {
  it.each([CalendarHeader, CalendarWeekdays, CalendarGrid])(
    "throws for part %#",
    { timeout: 5000 },
    (part) => {
      expect.hasAssertions();
      const warn = silenceVueWarnings();
      expect(() => mountRender(() => h(part))).toThrow(OUTSIDE_CALENDAR);
      expect(warn.mock.calls.flat()).toContainEqual(
        expect.stringContaining("[Vue warn]")
      );
    }
  );

  it("throws for a day", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const warn = silenceVueWarnings();
    const day: Period = { end: testDate, start: testDate, unit: "day" };

    expect(() => mountRender(() => h(CalendarDay, { day }))).toThrow(
      OUTSIDE_CALENDAR
    );
    expect(warn.mock.calls.flat()).toContainEqual(
      expect.stringContaining("[Vue warn]")
    );
  });
});
