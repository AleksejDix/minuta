import { derived, readable, type Readable } from "svelte/store";
import type { Period, AdapterUnit } from "minuta";
import { derivePeriod } from "minuta/operations";
import type { SvelteTemporal } from "./types";

/**
 * Creates a derived period store for any unit.
 */
export function usePeriod(
  temporal: SvelteTemporal,
  unit: AdapterUnit | Readable<AdapterUnit>
): Readable<Period> {
  const unitStore: Readable<AdapterUnit> =
    typeof unit === "string" ? readable(unit) : unit;

  return derived([temporal.browsing, unitStore], ([$browsing, $unit]) =>
    derivePeriod(temporal.adapter, $browsing.start, $unit)
  );
}
