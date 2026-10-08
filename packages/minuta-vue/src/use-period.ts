import type { AdapterUnit, Period } from "minuta";
import type { ComputedRef, Ref } from "vue";
import type { VueMinuta } from "./types";
import { computed } from "vue";
import { derivePeriod } from "minuta/operations";

/**
 * Resolves a plain or reactive unit to its current value.
 *
 * @param unit - The unit or a ref holding it
 * @returns The current unit
 */
function resolveUnit(
  unit: AdapterUnit | Ref<AdapterUnit> | ComputedRef<AdapterUnit>
): AdapterUnit {
  if (typeof unit === "string") {
    return unit;
  }
  return unit.value;
}

/**
 * Creates a reactive period of any unit type
 * This is the unified composable that can replace all individual unit composables
 *
 * @param minuta - The minuta instance whose browsing date is followed
 * @param unit - The unit, or a ref holding it for a reactive unit
 * @returns A computed period of the given unit around the browsing date
 *
 * @example
 * const year = usePeriod(minuta, "year")
 * const month = usePeriod(minuta, "month")
 * const customUnit = usePeriod(minuta, unitRef) // reactive unit
 */
function usePeriod(
  // oxlint-disable-next-line typescript/prefer-readonly-parameter-types -- VueMinuta holds Vue refs, which are mutable by design
  minuta: VueMinuta,
  unit: AdapterUnit | Ref<AdapterUnit> | ComputedRef<AdapterUnit>
): ComputedRef<Period> {
  return computed(() =>
    derivePeriod(minuta.adapter, minuta.browsing.value.start, resolveUnit(unit))
  );
}

export { usePeriod };
