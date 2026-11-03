/**
 * Test helpers: Temporal values from ISO strings, built with the runtime's
 * Temporal (native in the test browsers, else the polyfill the test setup
 * installed), the way an app builds them.
 */

import type { PlainDate, ZonedDateTime } from "@aleksejdix/minuta/core";
import type { Temporal } from "@js-temporal/polyfill";

type TemporalApi = typeof Temporal;

function hasTemporal(scope: object): scope is { Temporal: TemporalApi } {
  return "Temporal" in scope && scope.Temporal !== undefined;
}

function temporal(): TemporalApi {
  const scope: object = globalThis;
  if (!hasTemporal(scope)) {
    throw new Error("The test setup installs Temporal");
  }
  return scope.Temporal;
}

/**
 * A calendar date.
 *
 * @param iso - e.g. `"2026-03-18"`
 * @returns The PlainDate
 */
function date(iso: string): PlainDate {
  return temporal().PlainDate.from(iso);
}

/**
 * A moment in a zone.
 *
 * @param iso - e.g. `"2026-03-18T10:00[Europe/Zurich]"`
 * @returns The ZonedDateTime
 */
function zoned(iso: string): ZonedDateTime {
  return temporal().ZonedDateTime.from(iso);
}

/**
 * A moment in a zone, from an instant: `"2026-03-15T00:00:00Z"`.
 *
 * @param iso - An ISO instant
 * @param timeZone - The zone to read it in
 * @returns The ZonedDateTime
 */
function at(iso: string, timeZone: string): ZonedDateTime {
  return temporal().Instant.from(iso).toZonedDateTimeISO(timeZone);
}

/**
 * The current moment in the runtime's zone.
 *
 * @returns Now
 */
function now(): ZonedDateTime {
  return temporal().Now.zonedDateTimeISO();
}

export { at, date, now, zoned };
