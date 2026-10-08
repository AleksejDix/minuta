import { createContext, useContext } from "react";
import type { Context } from "react";
import type { MinutaState } from "./types";

const MinutaContext: Context<MinutaState | undefined> = createContext<
  MinutaState | undefined
>(undefined);

/**
 * The state provided by the closest `MinutaRoot`.
 *
 * @returns The minuta state of the closest `MinutaRoot`
 */
function useMinutaContext(): MinutaState {
  const minuta = useContext(MinutaContext);
  if (minuta === undefined) {
    throw new Error("useMinutaContext() must be used within <MinutaRoot>");
  }
  return minuta;
}

export { MinutaContext, useMinutaContext };
