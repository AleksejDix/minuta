/**
 * Temporal values for the site, from the runtime's Temporal: native where
 * the browser or Node has it, else the polyfill `temporalReady()` installed
 * (the build does that in astro.config.ts). The MDX pages use these.
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
    throw new Error("Await temporalReady() before the site computes");
  }
  return scope.Temporal;
}

/**
 * A calendar date.
 *
 * @param iso - e.g. `"2026-03-18"`
 * @returns The PlainDate
 */
function plainDate(iso: string): PlainDate {
  return temporal().PlainDate.from(iso);
}

/**
 * A moment, in a zone or from an instant.
 *
 * @param iso - e.g. `"2026-03-18T10:00[Europe/Zurich]"`
 * @returns The ZonedDateTime
 */
function zonedDateTime(iso: string): ZonedDateTime {
  return temporal().ZonedDateTime.from(iso);
}

/**
 * An instant, which minuta reads in the units' time zone.
 *
 * @param iso - e.g. `"2026-03-18T10:00:00Z"`
 * @returns The Instant
 */
function instant(iso: string): Readonly<Temporal.Instant> {
  return temporal().Instant.from(iso);
}

export { instant, plainDate, zonedDateTime };
