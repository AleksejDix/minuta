import {
  derived,
  get,
  readable,
  writable,
  type Readable,
  type Writable,
} from "svelte/store";
import { period } from "@allystudio/usetemporal/operations";
import type { Period } from "@allystudio/usetemporal";
import { createTemporalBuilder } from "./builder";
import type {
  CreateTemporalOptions,
  TemporalBuilder,
  SvelteTemporal,
} from "./types";
import { provideTemporal } from "./temporalContext";

function tryProvideTemporal(builder: TemporalBuilder) {
  try {
    provideTemporal(builder);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : String(error ?? "");
    if (
      !message.includes("outside component") &&
      !message.includes("lifecycle_outside_component")
    ) {
      throw error;
    }
  }
}

/**
 * Creates a temporal instance with builder methods for Svelte.
 */
export function createTemporal(
  options: CreateTemporalOptions
): TemporalBuilder {
  if (!options.adapter) {
    throw new Error(
      "A date adapter is required. Please install and provide an adapter from @allystudio/usetemporal/* packages."
    );
  }

  const dateStore: Writable<Date> = options.date ?? writable(new Date());
  const nowStore: Readable<Date> = options.now ?? readable(new Date());

  const browsing = writable<Period>(
    period(options.adapter, get(dateStore), "day")
  );

  const now = derived(nowStore, ($now) =>
    period(options.adapter, $now, "second")
  );

  const temporal: SvelteTemporal = {
    adapter: options.adapter,
    weekStartsOn: options.weekStartsOn ?? 1,
    locale: options.locale ?? "en",
    browsing,
    now,
  };

  const builder = createTemporalBuilder(temporal);
  tryProvideTemporal(builder);
  return builder;
}
