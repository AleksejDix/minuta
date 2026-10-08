import type { InjectionKey } from "vue";
import type { MinutaState } from "#src/types";
import { inject } from "vue";

const minutaContextKey: InjectionKey<MinutaState> = Symbol("MinutaContext");

/**
 * Reads the minuta state provided by the nearest `<MinutaRoot>`.
 *
 * @returns The state of the nearest `<MinutaRoot>`
 */
function useMinutaContext(): MinutaState {
  // oxlint-disable-next-line unicorn/no-useless-undefined -- An explicit default stops Vue from warning about a missing injection
  const minuta = inject(minutaContextKey, undefined);
  if (minuta === undefined) {
    throw new Error("useMinutaContext() must be used within <MinutaRoot>");
  }
  return minuta;
}

export { minutaContextKey, useMinutaContext };
