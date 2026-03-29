import { useMemo } from "react";
import { derivePeriod } from "minuta/operations";
import type { AdapterUnit, TimePeriod } from "minuta";
import type { MinutaBuilder } from "./types";

/**
 * Creates a reactive period of any unit type
 * Period updates when temporal.browsing changes
 *
 * @example
 * const year = usePeriod(temporal, 'year')
 * const month = usePeriod(temporal, 'month')
 */
export function usePeriod(
  temporal: MinutaBuilder,
  unit: AdapterUnit
): TimePeriod {
  return useMemo(
    () => derivePeriod(temporal.adapter, temporal.browsing.start, unit),
    [temporal.adapter, temporal.browsing, unit]
  );
}
