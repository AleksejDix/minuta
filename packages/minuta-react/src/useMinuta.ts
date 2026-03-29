import { useState, useMemo } from "react";
import { derivePeriod } from "minuta";
import { createMinutaBuilder } from "./builder";
import type { UseMinutaOptions, MinutaBuilder, ReactMinuta } from "./types";

/**
 * Creates a minuta instance with builder methods
 *
 * Returns a minuta builder that provides convenience methods
 * wrapping pure operations. Methods automatically pass the adapter.
 *
 * @param options - Configuration options
 * @returns A minuta builder with convenience methods
 *
 * @example
 * ```typescript
 * const minuta = useMinuta({
 *   adapter: nativeAdapter,
 *   date: new Date()
 * });
 *
 * const year = minuta.period(new Date(), "year");
 * const months = minuta.divide(year, "month");
 * ```
 */
export function useMinuta(options: UseMinutaOptions): MinutaBuilder {
  if (!options.adapter) {
    throw new Error(
      "A date adapter is required. Please install and provide an adapter from minuta/* packages."
    );
  }

  const {
    adapter,
    date = new Date(),
    now: nowDate = new Date(),
    weekStartsOn = 1,
  } = options;

  const [browsingDate, setBrowsingDate] = useState(date);

  // Create reactive Period for browsing (default to 'day' unit for point in time)
  const browsing = useMemo(
    () => derivePeriod(adapter, browsingDate, "day"),
    [adapter, browsingDate]
  );

  // Create reactive Period for now (use 'second' for most precise point in time)
  const now = useMemo(
    () => derivePeriod(adapter, nowDate, "second"),
    [adapter, nowDate]
  );

  // Create base minuta state
  const reactMinuta: ReactMinuta = {
    adapter,
    weekStartsOn,
    browsing,
    now,
  };

  return createMinutaBuilder(reactMinuta, setBrowsingDate);
}
