import type {
  DateUnit,
  PlainDate,
  Unit,
  Units,
  ZonedDateTime,
} from "#src/types";
import type { SnapOptions } from "./snap";
import { snapAny } from "./snap";

/**
 * Snap a date or a moment to a boundary of `step` units: the unit's start,
 * or every `step`-th one counted from the start of the enclosing unit
 * (minutes from the hour, hours from the day, days from the month, months
 * and quarters from the year; weeks and years from 1970). A date snaps to
 * dates; a moment snaps to moments in its zone, for date units to the start
 * of a day.
 *
 * @example
 * snapWith(units, Temporal.ZonedDateTime.from("2026-03-15T10:37[Europe/Zurich]"), "minute", { step: 15 }); // 10:30
 * snapWith(units, Temporal.ZonedDateTime.from("2026-03-15T10:37[Europe/Zurich]"), "day", { mode: "ceil" }); // Mar 16 00:00
 * snapWith(units, Temporal.PlainDate.from("2026-03-18"), "week", { mode: "floor" }); // 2026-03-16
 *
 * @param units - Available unit specs
 * @param value - The date or moment to snap
 * @param unit - The unit whose boundaries to snap to
 * @param options - `step` (units between boundaries) and `mode`
 * @returns The boundary, of the value's kind; `value` itself when it is one
 * @throws {TypeError} For a date and a time unit: dates snap to date units
 */
// oxlint-disable-next-line eslint/max-params -- Context-first core signature: (units, value, unit, options)
function snapWith(
  units: Units,
  value: PlainDate,
  unit: DateUnit,
  options?: SnapOptions
): PlainDate;
// oxlint-disable-next-line eslint/max-params -- Context-first core signature: (units, value, unit, options)
function snapWith(
  units: Units,
  value: ZonedDateTime,
  unit: Unit,
  options?: SnapOptions
): ZonedDateTime;
// oxlint-disable-next-line eslint/max-params -- Context-first core signature: (units, value, unit, options)
function snapWith(
  units: Units,
  value: PlainDate | ZonedDateTime,
  unit: Unit,
  options?: SnapOptions
): PlainDate | ZonedDateTime {
  return snapAny(units, value, unit, options);
}

export { snapWith };
