/**
 * Test helpers: Temporal values from ISO strings, and periods as text, so
 * assertions read like the ISO 8601 intervals they stand for.
 */

import type { Period } from "#src/types";
import { Temporal } from "temporal-polyfill/full";

/**
 * A calendar date.
 *
 * @param iso - e.g. `"2026-03-18"`
 * @returns The PlainDate
 */
function date(iso: string): Temporal.PlainDate {
  return Temporal.PlainDate.from(iso);
}

/**
 * A moment in a zone.
 *
 * @param iso - e.g. `"2026-03-18T10:00[Europe/Zurich]"`, with an offset to
 *   pick one of two repeated times: `"2026-11-01T01:30-05:00[America/New_York]"`
 * @returns The ZonedDateTime
 */
function zoned(iso: string): Temporal.ZonedDateTime {
  return Temporal.ZonedDateTime.from(iso);
}

/**
 * A period as `start/end unit`: `"2026-03-01/2026-04-01 month"`. Moments
 * show their offset and zone.
 *
 * @param period - Any period
 * @returns The text
 */
function text(period: Period): string {
  return `${period.start.toString()}/${period.end.toString()} ${period.unit}`;
}

export { date, text, zoned };
