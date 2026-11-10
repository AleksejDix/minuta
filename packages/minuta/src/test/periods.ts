/**
 * Test helpers for periods in Zurich: periods from ISO strings, and results
 * as text or "none".
 */

import type {
  AllUnits,
  DatePeriod,
  DateUnit,
  Period,
  TimePeriod,
} from "#src/types";
import { period as between, periodWith } from "#src/operations/period";
import { date, text, zoned } from "./temporal";
import { createUnits } from "#src/create-units";

/** Temporal units in Zurich. */
const zurichUnits: AllUnits = createUnits({ timeZone: "Europe/Zurich" });

/**
 * The period of `unit` holding a date.
 *
 * @param value - e.g. `"2026-03-18"`
 * @param unit - A date unit
 * @returns The date period
 */
function periodOf(value: string, unit: DateUnit): DatePeriod {
  return periodWith(zurichUnits, date(value), unit);
}

/**
 * The dates from `from` to `to`, `to` excluded.
 *
 * @param from - e.g. `"2026-03-01"`
 * @param to - e.g. `"2026-03-10"`
 * @returns The custom date period
 */
function days(from: string, to: string): DatePeriod {
  return between(date(from), date(to));
}

/**
 * The moments in Zurich from `from` to `to`, `to` excluded.
 *
 * @param from - e.g. `"2026-03-18T10:00"`
 * @param to - e.g. `"2026-03-18T12:00"`
 * @returns The custom time period
 */
function zurich(from: string, to: string): TimePeriod {
  return between(
    zoned(`${from}[Europe/Zurich]`),
    zoned(`${to}[Europe/Zurich]`)
  );
}

/**
 * A result as text, or `"none"`.
 *
 * @param period - A period or nothing
 * @returns The text
 */
function shown(period: Period | undefined): string {
  if (period === undefined) {
    return "none";
  }
  return text(period);
}

export { days, periodOf, shown, zurich, zurichUnits };
