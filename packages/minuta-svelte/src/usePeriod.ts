import { derived, readable, type Readable } from "svelte/store";
import type { TimePeriod, AdapterUnit } from "minuta";
import { derivePeriod } from "minuta/operations";
import type { SvelteMinuta } from "./types";

/**
 * Creates a derived period store for any unit.
 */
export function usePeriod(
  temporal: SvelteMinuta,
  unit: AdapterUnit | Readable<AdapterUnit>
): Readable<TimePeriod> {
  const unitStore: Readable<AdapterUnit> =
    typeof unit === "string" ? readable(unit) : unit;

  return derived([temporal.browsing, unitStore], ([$browsing, $unit]) =>
    derivePeriod(temporal.adapter, $browsing.start, $unit)
  );
}
