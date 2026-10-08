import type { Period, Unit } from "minuta/core";
import { computed, toValue } from "vue";
import type { ComputedRef } from "vue";
import type { Source } from "#src/types";
import { useMinutaContext } from "#src/minuta-context";

/**
 * The period of `unit` containing the start of the browsed period of the
 * nearest `<MinutaRoot>`.
 *
 * @example
 * const year = usePeriod("year");
 * const unit = ref<Unit>("week");
 * const current = usePeriod(unit);
 *
 * @param unit - The unit, or a ref or getter holding it
 * @returns The period, updated when browsing, units or unit change
 */
function usePeriod(unit: Source<Unit>): ComputedRef<Period> {
  const minuta = useMinutaContext();
  return computed(() =>
    minuta.period(minuta.browsing.value.start, toValue(unit))
  );
}

export { usePeriod };
