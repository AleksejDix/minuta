import { useState, useMemo } from "react";
import { derivePeriod } from "minuta";
import { createTemporalBuilder } from "./builder";
import type {
  UseTemporalOptions,
  TemporalBuilder,
  ReactTemporal,
} from "./types";

/**
 * Creates a temporal instance with builder methods
 *
 * Returns a temporal builder that provides convenience methods
 * wrapping pure operations. Methods automatically pass the adapter.
 *
 * @param options - Configuration options
 * @returns A temporal builder with convenience methods
 *
 * @example
 * ```typescript
 * const temporal = useTemporal({
 *   adapter: nativeAdapter,
 *   date: new Date()
 * });
 *
 * const year = temporal.period(new Date(), "year");
 * const months = temporal.divide(year, "month");
 * ```
 */
export function useTemporal(options: UseTemporalOptions): TemporalBuilder {
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

  // Create base temporal state
  const reactTemporal: ReactTemporal = {
    adapter,
    weekStartsOn,
    browsing,
    now,
  };

  return createTemporalBuilder(reactTemporal, setBrowsingDate);
}
