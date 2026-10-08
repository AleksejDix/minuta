import type { ReactElement, ReactNode } from "react";
import { MinutaContext } from "./minuta-context";
import type { MinutaOptions } from "./types";
import { createElement } from "react";
import { useMinuta } from "./use-minuta";

type MinutaRootProps = MinutaOptions &
  Readonly<{
    children?: ReactNode;
  }>;

/**
 * Owns the minuta state (`useMinuta(props)`) and provides it to its children,
 * which read it with `useMinutaContext()`.
 *
 * @param props - `useMinuta()` options and the children
 * @returns The context provider around the children
 */
// oxlint-disable-next-line typescript/prefer-readonly-parameter-types -- ReactNode contains ReactElement<any>, which cannot be deeply readonly
function MinutaRoot(props: MinutaRootProps): ReactElement {
  const minuta = useMinuta(props);
  return createElement(
    MinutaContext.Provider,
    { value: minuta },
    props.children
  );
}

export { MinutaRoot };
export type { MinutaRootProps };
