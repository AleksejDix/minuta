import type { JSX } from "react";
import { formatPeriod } from "minuta/format";
import { useCalendarContext } from "./calendar-context";
import { useCallback } from "react";
import { useMinutaContext } from "#src/minuta-context";

type CalendarHeaderProps = Readonly<{
  /** Locale of the month label, default: `"en-US"` */
  locale?: string | undefined;
}>;

const DEFAULT_LOCALE = "en-US";
const PREVIOUS_LABEL = "← Previous";
const NEXT_LABEL = "Next →";
const PREVIOUS_NAME = "Previous month";
const NEXT_NAME = "Next month";

/**
 * The browsed month's label, which names the grid and is announced when it
 * changes, between previous and next buttons.
 *
 * @param props - Component props
 * @param props.locale - Locale of the month label
 * @returns The header element
 */
function CalendarHeader({
  locale = DEFAULT_LOCALE,
}: CalendarHeaderProps): JSX.Element {
  const {
    browse,
    browsing,
    next: nextPeriod,
    previous: previousPeriod,
    units,
  } = useMinutaContext();
  const { labelId } = useCalendarContext();

  const handlePrevious = useCallback(() => {
    browse(previousPeriod(browsing));
  }, [browse, browsing, previousPeriod]);

  const handleNext = useCallback(() => {
    browse(nextPeriod(browsing));
  }, [browse, browsing, nextPeriod]);

  return (
    <header className="toolbar-row">
      <button
        type="button"
        className="nav-button"
        onClick={handlePrevious}
        aria-label={PREVIOUS_NAME}
      >
        {PREVIOUS_LABEL}
      </button>
      <h2 id={labelId} aria-live="polite">
        {formatPeriod(browsing, locale, { timeZone: units.timeZone })}
      </h2>
      <button
        type="button"
        className="nav-button"
        onClick={handleNext}
        aria-label={NEXT_NAME}
      >
        {NEXT_LABEL}
      </button>
    </header>
  );
}

export { CalendarHeader };
export type { CalendarHeaderProps };
