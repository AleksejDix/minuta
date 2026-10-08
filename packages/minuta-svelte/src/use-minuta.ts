import type { MinutaBuilder } from "./types";
import { injectMinuta } from "./minuta-context";

/**
 * Retrieves the current MinutaBuilder from context.
 */
export function useMinuta(): MinutaBuilder {
  return injectMinuta();
}
