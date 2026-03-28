import { computed, getCurrentInstance, ref } from "vue";
import { createTemporalBuilder } from "./builder";
import type {
  TemporalBuilder,
  CreateTemporalOptions,
  VueTemporal,
} from "./types";
import { provideTemporal } from "./temporalContext";

/**
 * Creates a temporal instance with builder methods (Level 2 API)
 *
 * Returns a temporal builder that provides convenience methods
 * wrapping pure operations. Methods automatically pass the adapter.
 *
 * @param options - Configuration options
 * @returns A temporal builder with convenience methods
 *
 * @example
 * ```typescript
 * const temporal = createTemporal({
 *   adapter: nativeAdapter,
 *   date: ref(new Date())
 * });
 *
 * const year = temporal.period(new Date(), "year");
 * const months = temporal.divide(year, "month");
 * ```
 */
export function createTemporal(
  options: CreateTemporalOptions
): TemporalBuilder {
  if (!options.adapter) {
    throw new Error(
      "A date adapter is required. Please install and provide an adapter from minuta/* packages."
    );
  }

  const browsingDate = options.date;
  const nowDate = options.now ?? ref(new Date());

  // Create a reactive Period for browsing that represents a point in time
  const browsing = ref<Period>({
    start: browsingDate.value,
    end: browsingDate.value,
    type: "day",
  });

  const now = computed<Period>(() => {
    const nowValue = nowDate.value;
    return {
      start: nowValue,
      end: nowValue,
      type: "second",
    };
  });

  const temporal: VueTemporal = {
    adapter: options.adapter,
    weekStartsOn: options.weekStartsOn ?? 1, // Default to Monday
    locale: options.locale ?? "en",
    browsing,
    now,
  };

  const builder = createTemporalBuilder(temporal);
  if (getCurrentInstance()) {
    provideTemporal(builder);
  }
  return builder;
}
