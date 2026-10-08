import type { MinutaBuilder, ReactMinuta, UseMinutaOptions } from "./types";
import { useMemo, useState } from "react";
import { createMinutaBuilder } from "./builder";
import { derivePeriod } from "minuta";

const MONDAY = 1;

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
function useMinuta(options: UseMinutaOptions): MinutaBuilder {
  // The type says required, but JavaScript callers may still omit it
  const givenAdapter: unknown = options.adapter;
  if (givenAdapter === undefined || givenAdapter === null) {
    throw new Error(
      "A date adapter is required. Please install and provide an adapter from minuta/* packages."
    );
  }

  const {
    adapter,
    date = new Date(),
    now: nowDate = new Date(),
    weekStartsOn = MONDAY,
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
    browsing,
    now,
    weekStartsOn,
  };

  return createMinutaBuilder(reactMinuta, setBrowsingDate);
}

export { useMinuta };
