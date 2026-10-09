import type { Minuta, Period, Units } from "minuta/core";
import type { MinutaOptions, MinutaState, Source } from "#src/types";
import { computed, shallowRef, toValue } from "vue";
import type { ComputedRef } from "vue";
import { nativeUnits } from "minuta/native";
import { withUnits } from "minuta/core";

const DEFAULT_UNITS: Units = nativeUnits();
const DEFAULT_UNIT = "month";

/**
 * Exposes the operations of the current units: each operation reads the
 * memoised `withUnits(units)` result, so a change of units is picked up.
 *
 * @param operations - The operations bound to the current units
 * @returns An object with the same members that always follow `operations`
 */
function followOperations(
  operations: ComputedRef<Minuta>
): Omit<Minuta, "units"> {
  const followed = {};
  // `units` is exposed as a ref instead
  const names = Object.keys(operations.value).filter(
    (name) => name !== "units"
  );
  for (const name of names) {
    Object.defineProperty(followed, name, {
      enumerable: true,
      get: (): unknown => Reflect.get(operations.value, name),
    });
  }
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The getters above define every operation of withUnits()
  return followed as Omit<Minuta, "units">;
}

/**
 * Browsing state plus every minuta operation, bound to the given units.
 * Options may be a plain object, a ref or a getter (such as component props);
 * `units`, `unit` and `now` stay reactive, `date` is only the initial date.
 *
 * @example
 * const minuta = useMinuta({ units: nativeUnits({ weekStartsOn: "sunday" }) });
 * minuta.browse(minuta.next(minuta.browsing.value));
 *
 * @param options - Units, initial date, today and the browsed unit
 * @returns The bound operations and the reactive browsing state
 */
function useMinuta(options: Source<MinutaOptions> = {}): MinutaState {
  const createdAt = new Date();
  const browsedDate = shallowRef<Readonly<Date>>(
    toValue(options).date ?? createdAt
  );
  const units = computed(() => toValue(options).units ?? DEFAULT_UNITS);
  const unit = computed(() => toValue(options).unit ?? DEFAULT_UNIT);
  const nowDate = computed(() => toValue(options).now ?? createdAt);
  const operations = computed(() => withUnits(units.value));
  const browsing = computed(() =>
    operations.value.period(browsedDate.value, unit.value)
  );
  const now = computed(() => operations.value.period(nowDate.value, "second"));

  /**
   * Browse the period containing the start of `period`.
   *
   * @param period - Any period; only its start is used
   */
  function browse(period: Period): void {
    browsedDate.value = period.start;
  }

  return Object.assign(followOperations(operations), {
    browse,
    browsing,
    now,
    units,
  });
}

export { useMinuta };
