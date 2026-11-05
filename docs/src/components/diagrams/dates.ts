/**
 * Calendar dates for the diagrams, from the runtime's Temporal (the build
 * installs the polyfill where Node has none).
 */

import type { PlainDate } from "@aleksejdix/minuta";
import type { Temporal } from "temporal-polyfill";

type TemporalApi = typeof Temporal;

function hasTemporal(scope: object): scope is { Temporal: TemporalApi } {
  return "Temporal" in scope && scope.Temporal !== undefined;
}

/**
 * A calendar date.
 *
 * @param iso - e.g. `"2026-03-18"`
 * @returns The PlainDate
 */
function plainDate(iso: string): PlainDate {
  const scope: object = globalThis;
  if (!hasTemporal(scope)) {
    throw new Error("Await temporalReady() before the diagrams compute");
  }
  return scope.Temporal.PlainDate.from(iso);
}

export { plainDate };
