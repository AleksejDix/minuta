import {
  CalendarGrid,
  CalendarHeader,
  CalendarRoot,
} from "#src/components/index";
import type { Period, Units } from "minuta/core";
import { h, nextTick } from "vue";
import type { VNode } from "vue";
import { mountRender } from "#src/test/mount";

type CalendarSetup = Readonly<{
  date?: Readonly<Date>;
  isDisabled?: (day: Period) => boolean;
  locale?: string;
  onSelect?: (day: Period) => void;
  units?: Units;
}>;

const JANUARY_15 = new Date("2024-01-15T00:00:00");

/**
 * Renders a calendar with a header and the grid, browsing January 2024.
 *
 * @param setup - Props of the root and the label locale
 * @returns The element holding the calendar
 */
function renderCalendar(setup: CalendarSetup = {}): HTMLElement {
  const { date = JANUARY_15, isDisabled, locale, onSelect, units } = setup;
  const props: Readonly<Record<string, unknown>> = {
    date,
    isDisabled,
    onSelect,
    units,
  };
  return mountRender(() =>
    h(CalendarRoot, props, {
      default: (): VNode[] => [
        h(CalendarHeader, { locale }),
        h(CalendarGrid, { locale }),
      ],
    })
  ).element;
}

/**
 * Finds the one element matching a selector.
 *
 * @param element - The container
 * @param selector - The CSS selector
 * @returns The element
 */
function find(element: HTMLElement, selector: string): HTMLElement {
  const found = element.querySelector<HTMLElement>(selector);
  if (found === null) {
    throw new Error(`Missing ${selector}`);
  }
  return found;
}

/**
 * Finds the day button with an accessible name.
 *
 * @param element - The container
 * @param label - The full date the day is named with
 * @returns The day button
 */
function dayNamed(element: HTMLElement, label: string): HTMLElement {
  return find(element, `button[aria-label="${label}"]`);
}

/**
 * The focused element.
 *
 * @returns The focused element
 */
function focused(): HTMLElement {
  const element = document.activeElement;
  if (!(element instanceof HTMLElement)) {
    throw new TypeError("Expected a focused element");
  }
  return element;
}

/**
 * The grid cell around a day.
 *
 * @param day - The day button
 * @returns Its cell
 */
function cellOf(day: HTMLElement): HTMLElement {
  const cell = day.closest("td");
  if (cell === null) {
    throw new Error("Expected the day inside a grid cell");
  }
  return cell;
}

/**
 * Presses a key on the focused element and waits for the re-render and the
 * focus move.
 *
 * @param key - The key
 * @param shiftKey - Whether Shift is held
 * @returns False when the calendar handled the key (default prevented)
 */
async function press(key: string, shiftKey = false): Promise<boolean> {
  const event = new KeyboardEvent("keydown", {
    bubbles: true,
    cancelable: true,
    key,
    shiftKey,
  });
  const notPrevented = focused().dispatchEvent(event);
  await nextTick();
  await nextTick();
  return notPrevented;
}

/**
 * The tabbable elements of the calendar.
 *
 * @param element - The container
 * @returns Every element with tabindex 0
 */
function tabbable(element: HTMLElement): HTMLElement[] {
  return [...element.querySelectorAll<HTMLElement>('[tabindex="0"]')];
}

export { cellOf, dayNamed, find, focused, press, renderCalendar, tabbable };
