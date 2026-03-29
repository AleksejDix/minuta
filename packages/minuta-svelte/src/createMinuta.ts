import {
  derived,
  get,
  readable,
  writable,
  type Readable,
  type Writable,
} from "svelte/store";
import { derivePeriod } from "minuta/operations";
import type { Period } from "minuta";
import { createMinutaBuilder } from "./builder";
import type { CreateMinutaOptions, MinutaBuilder, SvelteMinuta } from "./types";
import { provideMinuta } from "./minutaContext";

function tryProvideMinuta(builder: MinutaBuilder) {
  try {
    provideMinuta(builder);
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
 * Creates a minuta instance with builder methods for Svelte.
 */
export function createMinuta(options: CreateMinutaOptions): MinutaBuilder {
  if (!options.adapter) {
    throw new Error(
      "A date adapter is required. Please install and provide an adapter from minuta/* packages."
    );
  }

  const dateStore: Writable<Date> = options.date ?? writable(new Date());
  const nowStore: Readable<Date> = options.now ?? readable(new Date());

  const browsing = writable<Period>(
    derivePeriod(options.adapter, get(dateStore), "day")
  );

  const now = derived(nowStore, ($now) =>
    derivePeriod(options.adapter, $now, "second")
  );

  const minuta: SvelteMinuta = {
    adapter: options.adapter,
    weekStartsOn: options.weekStartsOn ?? 1,
    locale: options.locale ?? "en",
    browsing,
    now,
  };

  const builder = createMinutaBuilder(minuta);
  tryProvideMinuta(builder);
  return builder;
}
