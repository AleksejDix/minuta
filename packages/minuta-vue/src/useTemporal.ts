import type { TemporalBuilder } from "./types";
import { injectTemporal } from "./temporalContext";

/**
 * Injects the nearest temporal instance provided via createTemporal().
 *
 * @returns The current TemporalBuilder from context
 *
 * @example
 * ```ts
 * const temporal = useTemporal();
 * const month = temporal.period(new Date(), "month");
 * ```
 */
export function useTemporal(): TemporalBuilder {
  return injectTemporal();
}
