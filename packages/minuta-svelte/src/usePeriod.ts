import { derived, readable, type Readable } from "svelte/store";
import type { Period, AdapterUnit } from "minuta";
import { derivePeriod } from "minuta/operations";
import type { SvelteMinuta } from "./types";

/**
 * Creates a derived period store for any unit.
 */
export function usePeriod(
  minuta: SvelteMinuta,
  unit: AdapterUnit | Readable<AdapterUnit>
): Readable<Period> {
  const unitStore: Readable<AdapterUnit> =
    typeof unit === "string" ? readable(unit) : unit;

  return derived([minuta.browsing, unitStore], ([$browsing, $unit]) =>
    derivePeriod(minuta.adapter, $browsing.start, $unit)
  );
}
