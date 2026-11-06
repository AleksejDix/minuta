/**
 * The runtime's Temporal, read when parsing, never at import, so an app can
 * load a polyfill first (minuta's temporalReady).
 */

import type { Temporal } from "temporal-polyfill";

type TemporalApi = typeof Temporal;

const MISSING_TEMPORAL =
  "fechita needs Temporal: load it first (minuta's temporalReady()), or run on Chrome 144+, Firefox 139+, Node 26+";

function hasTemporal(scope: object): scope is { Temporal: TemporalApi } {
  return "Temporal" in scope && scope.Temporal !== undefined;
}

/**
 * The runtime's Temporal.
 *
 * @returns The Temporal namespace
 * @throws {Error} When there is none
 */
function temporal(): TemporalApi {
  const scope: object = globalThis;
  if (hasTemporal(scope)) {
    return scope.Temporal;
  }
  throw new Error(MISSING_TEMPORAL);
}

export { temporal };
export type { Temporal } from "temporal-polyfill";
