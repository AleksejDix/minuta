import { useMemo } from "react";
import { derivePeriod } from "minuta/operations";
import type { AdapterUnit, Period } from "minuta";
import type { TemporalBuilder } from "./types";

/**
 * Creates a reactive period of any unit type
 * Period updates when temporal.browsing changes
 *
 * @example
 * const year = usePeriod(temporal, 'year')
 * const month = usePeriod(temporal, 'month')
 */
export function usePeriod(
  temporal: TemporalBuilder,
  unit: AdapterUnit
): Period {
  return useMemo(
    () => derivePeriod(temporal.adapter, temporal.browsing.start, unit),
    [temporal.adapter, temporal.browsing, unit]
  );
}
