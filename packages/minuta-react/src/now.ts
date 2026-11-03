/**
 * The current moment, read from the runtime's Temporal (or the polyfill
 * that `temporalReady()` installed). The clock is `Date.now()`, the same
 * instant `Temporal.Now` reads, so fake timers in tests move it too.
 */

import type { Temporal } from "@js-temporal/polyfill";
import type { ZonedDateTime } from "@aleksejdix/minuta/core";

type TemporalApi = typeof Temporal;

function hasTemporal(scope: object): scope is { Temporal: TemporalApi } {
  return "Temporal" in scope && scope.Temporal !== undefined;
}

/**
 * The current moment in a time zone.
 *
 * @param timeZone - An IANA zone, e.g. the units' `timeZone`
 * @returns Now, in that zone
 * @throws {Error} When the runtime has no Temporal and the polyfill is not installed
 */
function currentMoment(timeZone: string): ZonedDateTime {
  const scope: object = globalThis;
  if (!hasTemporal(scope)) {
    throw new Error(
      "minuta-react needs Temporal: await temporalReady() from @aleksejdix/minuta/temporal first"
    );
  }
  return scope.Temporal.Instant.fromEpochMilliseconds(
    Date.now()
  ).toZonedDateTimeISO(timeZone);
}

export { currentMoment };
