import { contains, gap, move, period, resize, snap, split } from "#src/index";
import { describe, expect, it } from "vitest";
import { monthGridWith, yearGridWith } from "#src/calendar";
import { MinutaError } from "#src/units";
import { nativeUnits } from "#src/native";

const INVALID = new Date("nope");
const units = nativeUnits();
const day = period(new Date("2026-03-18T12:00"), "day");

const CALLS: readonly (readonly [string, string, () => unknown])[] = [
  ["contains", "target", () => contains(day, INVALID)],
  ["gap", "from", () => gap(INVALID, day)],
  ["gap", "to", () => gap(day, INVALID)],
  ["move", "targetDate", () => move(day, INVALID)],
  ["resize", "newDate", () => resize(day, "end", INVALID)],
  ["split", "splitDate", () => split(day, INVALID)],
  ["snap", "date", () => snap(INVALID, "hour")],
  ["monthGrid", "date", () => monthGridWith(units, INVALID)],
  ["yearGrid", "date", () => yearGridWith(units, INVALID)],
];

describe("invalid Date arguments", () => {
  it.each(CALLS)(
    "%s rejects an invalid %s",
    { timeout: 5000 },
    (_fn, name, call) => {
      expect.hasAssertions();
      expect(call).toThrow(
        `${MinutaError.InvalidDate}: ${name} is an invalid Date.`
      );
    }
  );
});
