import { describe, expect, it } from "vitest";
import {
  isWeekdayWith,
  isWeekendWith,
  monthGridWith,
  yearGridWith,
} from "#src/calendar";
import { dateFnsTzUnits } from "#src/date-fns-tz";
import { periodWith } from "#src/core";
import { snapWith } from "#src/intervals";

const MONDAY = 1;
const DECADE = 10;

// Zones away from any CI zone, including UTC+14
const ZONES: readonly string[] = [
  "Asia/Tokyo",
  "Pacific/Kiritimati",
  "America/Los_Angeles",
];

// Saturday 21 March 2026, 12:00 in each zone
const SATURDAY_NOON: Readonly<Record<string, string>> = {
  "America/Los_Angeles": "2026-03-21T19:00:00Z",
  "Asia/Tokyo": "2026-03-21T03:00:00Z",
  "Pacific/Kiritimati": "2026-03-20T22:00:00Z",
};

describe.each(ZONES)(
  "calendar facts follow the adapter zone %s",
  (timezone) => {
    const units = dateFnsTzUnits({
      timeZone: timezone,
      weekStartsOn: "monday",
    });
    const saturday = new Date(SATURDAY_NOON[timezone] ?? "");

    it("checks the weekend in the adapter's zone", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const day = periodWith(units, saturday, "day");
      expect(isWeekendWith(units, day)).toBe(true);
      expect(isWeekdayWith(units, day)).toBe(false);
    });

    it(
      "reports the grids' week start in the adapter's zone",
      { timeout: 5000 },
      () => {
        expect.hasAssertions();
        expect(monthGridWith(units, saturday).weekStartsOn).toBe(MONDAY);
        expect(yearGridWith(units, saturday).weekStartsOn).toBe(MONDAY);
      }
    );

    it("anchors decade steps in the adapter's zone", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const decade = snapWith(units, saturday, "year", {
        mode: "floor",
        step: DECADE,
      });
      expect(decade).toStrictEqual(
        periodWith(units, new Date("2020-07-01T00:00:00Z"), "year").start
      );
    });
  }
);
