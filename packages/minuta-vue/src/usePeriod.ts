import { computed, type ComputedRef, type Ref } from "vue";
import { derivePeriod } from "minuta/operations";
import type { Period, AdapterUnit } from "minuta";
import type { VueMinuta } from "./types";

/**
 * Creates a reactive period of any unit type
 * This is the unified composable that can replace all individual unit composables
 *
 * @example
 * const year = usePeriod(minuta, "year")
 * const month = usePeriod(minuta, "month")
 * const customUnit = usePeriod(minuta, unitRef) // reactive unit
 */
export function usePeriod(
  minuta: VueMinuta,
  unit: AdapterUnit | Ref<AdapterUnit> | ComputedRef<AdapterUnit>
): ComputedRef<Period> {
  return computed(() => {
    const unitValue = typeof unit === "string" ? unit : unit.value;
    return derivePeriod(minuta.adapter, minuta.browsing.value.start, unitValue);
  });
}
