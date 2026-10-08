import { useMemo } from "react";
import { derivePeriod } from "minuta/operations";
import type { AdapterUnit, Period } from "minuta";
import type { MinutaBuilder } from "./types";

/**
 * Creates a reactive period of any unit type
 * Period updates when minuta.browsing changes
 *
 * @example
 * const year = usePeriod(minuta, 'year')
 * const month = usePeriod(minuta, 'month')
 */
export function usePeriod(minuta: MinutaBuilder, unit: AdapterUnit): Period {
  return useMemo(
    () => derivePeriod(minuta.adapter, minuta.browsing.start, unit),
    [minuta.adapter, minuta.browsing, unit]
  );
}
