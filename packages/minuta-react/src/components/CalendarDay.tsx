import type {
  JSX,
  KeyboardEvent,
  KeyboardEventHandler,
  RefObject,
} from "react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import type { Period } from "minuta/core";
import { dayForKey } from "./day-navigation";
import { useCalendarContext } from "./calendar-context";
import { useMinutaContext } from "#src/minuta-context";

type CalendarDayProps = Readonly<{
  /** The day period of this cell */
  day: Period;
  /** Locale of the day number, weekday title and label, default: `"en-US"` */
  locale?: string | undefined;
}>;

type DayLabels = Readonly<{ full: string; number: string; weekday: string }>;

type DayState = Readonly<{
  isActive: boolean;
  isDisabled: boolean;
  isOutside: boolean;
  isSelected: boolean;
  isToday: boolean;
}>;

const DEFAULT_LOCALE = "en-US";
const TABBABLE = 0;
const NOT_TABBABLE = -1;
const SELECT_KEYS: ReadonlySet<string> = new Set(["Enter", " "]);

/**
 * The day number, the short weekday and the full date of `date` in
 * `timeZone`.
 *
 * @param date - The day's start
 * @param locale - BCP 47 locale
 * @param timeZone - The units' time zone, undefined for the runtime's
 * @returns The labels
 */
function dayLabels(
  date: Readonly<Date>,
  locale: string,
  timeZone: string | undefined
): DayLabels {
  return {
    full: new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "long",
      timeZone,
      weekday: "long",
      year: "numeric",
    }).format(date),
    number: new Intl.DateTimeFormat(locale, {
      day: "numeric",
      timeZone,
    }).format(date),
    weekday: new Intl.DateTimeFormat(locale, {
      timeZone,
      weekday: "short",
    }).format(date),
  };
}

function dayClassName(state: DayState): string {
  const classes = ["day-cell"];
  if (state.isOutside) {
    classes.push("is-outside");
  }
  if (state.isToday) {
    classes.push("is-today");
  }
  if (state.isSelected) {
    classes.push("is-selected");
  }
  if (state.isDisabled) {
    classes.push("is-disabled");
  }
  return classes.join(" ");
}

function ariaCurrent(isToday: boolean): "date" | undefined {
  if (isToday) {
    return "date";
  }
  return undefined;
}

function tabIndex(isActive: boolean): number {
  if (isActive) {
    return TABBABLE;
  }
  return NOT_TABBABLE;
}

/**
 * Where `day` stands in the calendar: outside the browsed month, today,
 * selected, disabled or the tabbable day.
 *
 * @param day - The day period
 * @returns Its state
 */
function useDayState(day: Period): DayState {
  const { browsing, contains, now, same } = useMinutaContext();
  const { active, isDisabled, selected } = useCalendarContext();
  return {
    isActive: same(active, day, "day"),
    isDisabled: isDisabled(day),
    isOutside: !contains(browsing, day.start),
    isSelected: selected !== undefined && same(selected, day, "day"),
    isToday: contains(day, now.start),
  };
}

/**
 * Focuses the day when the keyboard moved the focus to it.
 *
 * @param day - The day period
 * @param isActive - Whether the day is the tabbable one
 * @returns The ref of the day's button
 */
function useKeyboardFocus(
  day: Period,
  isActive: boolean
): RefObject<HTMLButtonElement> {
  const { takeFocus } = useCalendarContext();
  const button = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (isActive && takeFocus(day) && button.current !== null) {
      button.current.focus();
    }
  }, [day, isActive, takeFocus]);
  return button;
}

/**
 * The keydown handler of a day: Enter and Space select it, the navigation
 * keys move the focus.
 *
 * @param day - The day period
 * @returns The handler
 */
function useDayKeys(day: Period): KeyboardEventHandler<HTMLButtonElement> {
  const minuta = useMinutaContext();
  const { focus, select } = useCalendarContext();
  return useCallback(
    // oxlint-disable-next-line typescript/prefer-readonly-parameter-types -- React's synthetic events are mutable by design
    (event: KeyboardEvent<HTMLButtonElement>) => {
      const target = dayForKey(minuta, day, event);
      if (SELECT_KEYS.has(event.key)) {
        event.preventDefault();
        select(day);
      } else if (target !== undefined) {
        event.preventDefault();
        if (!minuta.same(target, day, "day")) {
          focus(target);
        }
      }
    },
    [day, focus, minuta, select]
  );
}

/**
 * One day cell: dimmed outside the browsed month, marked when it is today or
 * selected. A click, Enter or Space selects it; the arrow keys, Home, End,
 * PageUp and PageDown move the focus. Only the active day is tabbable.
 *
 * @param props - Component props
 * @param props.day - The day period of this cell
 * @param props.locale - Locale of the labels
 * @returns The day button
 */
function CalendarDay({
  day,
  locale = DEFAULT_LOCALE,
}: CalendarDayProps): JSX.Element {
  const { units } = useMinutaContext();
  const { select } = useCalendarContext();
  const state = useDayState(day);
  const button = useKeyboardFocus(day, state.isActive);
  const handleKeyDown = useDayKeys(day);
  const labels = useMemo(
    () => dayLabels(day.start, locale, units.timeZone),
    [day, locale, units]
  );

  const handleClick = useCallback(() => {
    select(day);
  }, [day, select]);

  return (
    <button
      ref={button}
      type="button"
      className={dayClassName(state)}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={tabIndex(state.isActive)}
      title={labels.weekday}
      aria-label={labels.full}
      aria-current={ariaCurrent(state.isToday)}
      aria-disabled={state.isDisabled}
    >
      <span className="date-number">{labels.number}</span>
      <span className="weekday-label">{labels.weekday}</span>
    </button>
  );
}

export { CalendarDay };
export type { CalendarDayProps };
