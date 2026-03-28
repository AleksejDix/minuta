import type { TemporalBuilder } from "./types";
import { injectTemporal } from "./temporalContext";

/**
 * Retrieves the current TemporalBuilder from context.
 */
export function useTemporal(): TemporalBuilder {
  return injectTemporal();
}
