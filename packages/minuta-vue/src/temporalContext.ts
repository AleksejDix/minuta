import { inject, provide } from "vue";
import type { TemporalBuilder } from "./types";

const TEMPORAL_CONTEXT_KEY = Symbol("TemporalContext");

export function provideTemporal(builder: TemporalBuilder) {
  provide(TEMPORAL_CONTEXT_KEY, builder);
}

export function injectTemporal(): TemporalBuilder {
  const temporal = inject<TemporalBuilder | null>(TEMPORAL_CONTEXT_KEY, null);
  if (!temporal) {
    throw new Error(
      "No temporal instance provided. Call createTemporal() in an ancestor component before using useTemporal()."
    );
  }
  return temporal;
}
