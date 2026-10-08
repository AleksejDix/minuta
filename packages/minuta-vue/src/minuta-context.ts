import { inject, provide } from "vue";
import type { MinutaBuilder } from "./types";

const MINUTA_CONTEXT_KEY = Symbol("MinutaContext");

// oxlint-disable-next-line typescript/prefer-readonly-parameter-types -- MinutaBuilder holds Vue refs, which are mutable by design
function provideMinuta(builder: MinutaBuilder): void {
  provide(MINUTA_CONTEXT_KEY, builder);
}

function injectMinuta(): MinutaBuilder {
  const minuta = inject<MinutaBuilder | undefined>(
    MINUTA_CONTEXT_KEY,
    // oxlint-disable-next-line unicorn/no-useless-undefined -- An explicit default stops Vue from warning about a missing injection
    undefined
  );
  if (minuta === undefined) {
    throw new Error(
      "No minuta instance provided. Call createMinuta() in an ancestor component before using useMinuta()."
    );
  }
  return minuta;
}

export { injectMinuta, provideMinuta };
