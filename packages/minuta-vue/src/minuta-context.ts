import { inject, provide } from "vue";
import type { MinutaBuilder } from "./types";

const MINUTA_CONTEXT_KEY = Symbol("MinutaContext");

export function provideMinuta(builder: MinutaBuilder) {
  provide(MINUTA_CONTEXT_KEY, builder);
}

export function injectMinuta(): MinutaBuilder {
  const minuta = inject<MinutaBuilder | null>(MINUTA_CONTEXT_KEY, null);
  if (!minuta) {
    throw new Error(
      "No minuta instance provided. Call createMinuta() in an ancestor component before using useMinuta()."
    );
  }
  return minuta;
}
