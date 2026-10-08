import type { Adapter, Period } from "minuta";
import type { CreateMinutaOptions, MinutaBuilder, VueMinuta } from "./types";
import { computed, getCurrentInstance, ref } from "vue";
import { createMinutaBuilder } from "./builder";
import { provideMinuta } from "./minuta-context";

/** Default to Monday. */
const DEFAULT_WEEK_STARTS_ON = 1;

/**
 * Returns the adapter, or throws when a caller did not provide one.
 *
 * @param adapter - The adapter from the options, possibly missing at runtime
 * @returns The provided adapter
 */
function requireAdapter(
  adapter: Readonly<Adapter> | null | undefined
): Adapter {
  if (!adapter) {
    throw new Error(
      "A date adapter is required. Please install and provide an adapter from minuta/* packages."
    );
  }
  return adapter;
}

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
// oxlint-disable-next-line typescript/prefer-readonly-parameter-types -- The options carry Vue refs, which are mutable by design
function createMinuta(options: CreateMinutaOptions): MinutaBuilder {
  const adapter = requireAdapter(options.adapter);
  const browsingDate = options.date;
  const nowDate = options.now ?? ref(new Date());

  // Create a reactive Period for browsing that represents a point in time
  const browsing = ref<Period>({
    end: browsingDate.value,
    start: browsingDate.value,
    type: "day",
  });

  const now = computed<Period>(() => {
    const nowValue = nowDate.value;
    return {
      end: nowValue,
      start: nowValue,
      type: "second",
    };
  });

  const minuta: VueMinuta = {
    adapter,
    browsing,
    locale: options.locale ?? "en",
    now,
    weekStartsOn: options.weekStartsOn ?? DEFAULT_WEEK_STARTS_ON,
  };

  const builder = createMinutaBuilder(minuta);
  if (getCurrentInstance()) {
    provideMinuta(builder);
  }
  return builder;
}

export { createMinuta };
