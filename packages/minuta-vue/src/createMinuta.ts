import { computed, getCurrentInstance, ref } from "vue";
import type { Period } from "minuta";
import { createMinutaBuilder } from "./builder";
import type { MinutaBuilder, CreateMinutaOptions, VueMinuta } from "./types";
import { provideMinuta } from "./minutaContext";

/**
 * Creates a minuta instance with builder methods (Level 2 API)
 *
 * Returns a minuta builder that provides convenience methods
 * wrapping pure operations. Methods automatically pass the adapter.
 *
 * @param options - Configuration options
 * @returns A minuta builder with convenience methods
 *
 * @example
 * ```typescript
 * const minuta = createMinuta({
 *   adapter: nativeAdapter,
 *   date: ref(new Date())
 * });
 *
 * const year = minuta.period(new Date(), "year");
 * const months = minuta.divide(year, "month");
 * ```
 */
export function createMinuta(options: CreateMinutaOptions): MinutaBuilder {
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

  const minuta: VueMinuta = {
    adapter: options.adapter,
    weekStartsOn: options.weekStartsOn ?? 1, // Default to Monday
    locale: options.locale ?? "en",
    browsing,
    now,
  };

  const builder = createMinutaBuilder(minuta);
  if (getCurrentInstance()) {
    provideMinuta(builder);
  }
  return builder;
}
