import { computed, type ComputedRef, type Ref } from "vue";
import { derivePeriod } from "minuta/operations";
import type { Period, AdapterUnit } from "minuta";
import type { VueTemporal } from "./types";

/**
 * Creates a reactive period of any unit type
 * This is the unified composable that can replace all individual unit composables
 *
 * @example
 * const year = usePeriod(temporal, "year")
 * const month = usePeriod(temporal, "month")
 * const customUnit = usePeriod(temporal, unitRef) // reactive unit
 */
export function usePeriod(
  temporal: VueTemporal,
  unit: AdapterUnit | Ref<AdapterUnit> | ComputedRef<AdapterUnit>
): ComputedRef<Period> {
  return computed(() => {
    const unitValue = typeof unit === "string" ? unit : unit.value;
    return derivePeriod(
      temporal.adapter,
      temporal.browsing.value.start,
      unitValue
    );
  });
}
