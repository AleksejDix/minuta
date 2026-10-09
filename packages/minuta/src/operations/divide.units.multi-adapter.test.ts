import { describe, expect, it } from "vitest";
import { periodWith, range } from "./period";
import { divideWith } from "./divide";
import { getUnitsTestCases } from "#src/test/shared-adapter-tests";

const unitsCases = getUnitsTestCases();

describe.each(unitsCases)(
  "divideWith() chunk units with %s adapter",
  (_name, units) => {
    it("marks clipped first and last chunks custom", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const span = range(
        new Date("2026-03-18T10:30"),
        new Date("2026-03-18T12:30")
      );
      const chunks = divideWith(units, span, "hour").map((chunk) => chunk.unit);
      expect(chunks).toStrictEqual(["custom", "hour", "custom"]);
    });

    it("marks partial weeks of a month custom", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const march = periodWith(units, new Date("2026-03-18T12:00"), "month");
      const weeks = divideWith(units, march, "week").map((week) => week.unit);
      // Weeks start on Monday: Sun 1 and Mon 30–Tue 31 are partial
      expect(weeks).toStrictEqual([
        "custom",
        "week",
        "week",
        "week",
        "week",
        "custom",
      ]);
    });

    it("marks a unit larger than the period custom", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const march = periodWith(units, new Date("2026-03-18T12:00"), "month");
      expect(divideWith(units, march, "year")).toStrictEqual([
        range(march.start, march.end),
      ]);
    });

    it("keeps the unit of whole chunks", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const march = periodWith(units, new Date("2026-03-18T12:00"), "month");
      const days = divideWith(units, march, "day");
      expect(days.every((day) => day.unit === "day")).toBe(true);
    });
  }
);
