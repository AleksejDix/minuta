import type { Temporal } from "temporal-polyfill";

type TemporalApi = typeof Temporal;

const MISSING_TEMPORAL =
  "minuta needs Temporal: await temporalReady() first, or run on Chrome 144+, Firefox 139+, Node 26+";

/**
 * Check whether a scope object exposes a Temporal implementation.
 * @param scope - The object to inspect (usually `globalThis`)
 * @returns True when `scope.Temporal` is defined
 */
function hasTemporal(scope: object): scope is { Temporal: TemporalApi } {
  return "Temporal" in scope && scope.Temporal !== undefined;
}

/**
 * Read the runtime's Temporal when computing, never at import.
 * @returns The Temporal namespace
 * @throws {Error} When the runtime has no Temporal and `temporalReady()` has not installed the polyfill
 */
function getTemporal(): TemporalApi {
  const scope: object = globalThis;
  if (hasTemporal(scope)) {
    return scope.Temporal;
  }
  throw new Error(MISSING_TEMPORAL);
}

/**
 * Make Temporal available before minuta computes with it. Does nothing where
 * the runtime has Temporal (Chrome and Edge 144+, Firefox 139+, Node 26+);
 * elsewhere it loads `temporal-polyfill` in its own chunk and installs it
 * on `globalThis`. Await it once, before anything renders.
 *
 * @example
 * import { createUnits } from "@aleksejdix/minuta/core";
import { temporalReady } from "@aleksejdix/minuta/temporal";
 *
 * await temporalReady();
 * const units = createUnits();
 *
 * @returns Resolves once `globalThis.Temporal` exists
 */
async function temporalReady(): Promise<void> {
  if (hasTemporal(globalThis)) {
    return;
  }
  const { Temporal: polyfill } = await import("temporal-polyfill/full");
  Object.assign(globalThis, { Temporal: polyfill });
}

export { getTemporal, temporalReady };
