import type { Period, Unit } from "minuta/core";
import { useMemo } from "react";
import { useMinutaContext } from "./minuta-context";

/**
 * The period of `unit` containing the start of the browsed period of the
 * closest `MinutaRoot`. Updates when browsing or the units change.
 *
 * @example
 * const week = usePeriod("week");
 *
 * @param unit - Unit of the period
 * @returns The period of `unit` containing the browsed period's start
 */
function usePeriod(unit: Unit): Period {
  const minuta = useMinutaContext();
  return useMemo(
    () => minuta.period(minuta.browsing.start, unit),
    [minuta, unit]
  );
}

export { usePeriod };
