import type { JSX } from "react";
import type { MinutaBuilder } from "#src/types";
import type { ReadonlyPeriod } from "minuta";
import { useCallback } from "react";

type NavigationControlsProps = Readonly<{
  minuta: MinutaBuilder;
  targetPeriod: ReadonlyPeriod;
}>;

const PREVIOUS_LABEL = "← Previous";
const NEXT_LABEL = "Next →";

function NavigationControls({
  minuta,
  targetPeriod,
}: NavigationControlsProps): JSX.Element {
  const handlePrevious = useCallback(() => {
    minuta.previous(targetPeriod);
  }, [minuta, targetPeriod]);

  const handleNext = useCallback(() => {
    minuta.next(targetPeriod);
  }, [minuta, targetPeriod]);

  return (
    <div className="toolbar-row">
      <button type="button" className="nav-button" onClick={handlePrevious}>
        {PREVIOUS_LABEL}
      </button>
      <button type="button" className="nav-button" onClick={handleNext}>
        {NEXT_LABEL}
      </button>
    </div>
  );
}

export { NavigationControls };
