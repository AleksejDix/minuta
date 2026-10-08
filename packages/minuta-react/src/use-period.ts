import type { AdapterUnit, Period } from "minuta";
import type { MinutaBuilder } from "./types";
import { derivePeriod } from "minuta/operations";
import { useMemo } from "react";

/**
 * Creates a reactive period of any unit type
 * Period updates when minuta.browsing changes
 *
 * @param minuta - The minuta builder returned by useMinuta()
 * @param unit - The unit of the derived period
 * @returns The period of `unit` containing the browsing date
 *
 * @example
 * const year = usePeriod(minuta, 'year')
 * const month = usePeriod(minuta, 'month')
 */
function usePeriod(minuta: MinutaBuilder, unit: AdapterUnit): Period {
  return useMemo(
    () => derivePeriod(minuta.adapter, minuta.browsing.start, unit),
    [minuta.adapter, minuta.browsing, unit]
  );
}

export { usePeriod };
