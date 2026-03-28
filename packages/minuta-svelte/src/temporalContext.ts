import { getContext, setContext } from "svelte";
import type { TemporalBuilder } from "./types";

const TEMPORAL_CONTEXT_KEY = Symbol("TemporalContext");

export function provideTemporal(builder: TemporalBuilder) {
  setContext(TEMPORAL_CONTEXT_KEY, builder);
}

export function injectTemporal(): TemporalBuilder {
  const temporal = getContext<TemporalBuilder>(TEMPORAL_CONTEXT_KEY);
  if (!temporal) {
    throw new Error(
      "No temporal instance provided. Call createTemporal() inside a component before using useTemporal()."
    );
  }
  return temporal;
}
