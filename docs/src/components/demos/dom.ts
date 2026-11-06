/**
 * Small DOM helpers the concept demos share: find a demo's parts, show text,
 * label dates.
 */

import type { PlainDate, ZonedDateTime } from "@aleksejdix/minuta";
import type { Temporal } from "temporal-polyfill";

type TemporalApi = typeof Temporal;

function hasTemporal(scope: object): scope is { Temporal: TemporalApi } {
  return "Temporal" in scope && scope.Temporal !== undefined;
}

// The runtime's Temporal, or the polyfill temporalReady() installed
function temporal(): TemporalApi {
  const scope: object = globalThis;
  if (!hasTemporal(scope)) {
    throw new Error("Await temporalReady() before the demos compute");
  }
  return scope.Temporal;
}

const DAY_LABEL = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  weekday: "short",
  year: "numeric",
});

const TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "numeric",
  hour: "2-digit",
  hourCycle: "h23",
  minute: "2-digit",
  month: "short",
  second: "2-digit",
  year: "numeric",
};

const TIME_LABEL = new Intl.DateTimeFormat("en-US", TIME_OPTIONS);

const DAY_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  weekday: "short",
  year: "numeric",
};

/**
 * Every element of the page that hosts the demo `name`.
 *
 * @param name - The demo's `data-demo` value
 * @returns The demo roots
 */
function demoRoots(name: string): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>(`[data-demo="${name}"]`)];
}

/**
 * The element marked `data-part="name"` inside `root`, of the given kind.
 *
 * @param root - The demo root
 * @param name - The part's `data-part` value
 * @param kind - The element class it must be, e.g. `HTMLInputElement`
 * @returns The element
 */
function part<Kind extends HTMLElement>(
  root: HTMLElement,
  name: string,
  kind: new () => Kind
): Kind {
  const element = root.querySelector(`[data-part="${name}"]`);
  if (!(element instanceof kind)) {
    throw new TypeError(`Demo part "${name}" is missing`);
  }
  return element;
}

/**
 * Replace an element's children with list items of `texts`.
 *
 * @param list - The list to fill
 * @param texts - One item each
 */
function fillList(list: HTMLElement, texts: readonly string[]): void {
  list.replaceChildren(
    ...texts.map((text) => {
      const item = document.createElement("li");
      item.textContent = text;
      return item;
    })
  );
}

/**
 * A date as "Sat, Jan 31, 2026".
 *
 * @param date - The date
 * @returns The label
 */
function dayLabel(date: Readonly<Date>): string {
  return DAY_LABEL.format(date);
}

/**
 * A date with its time as "Jan 31, 2026, 23:59:59".
 *
 * @param date - The date
 * @returns The label
 */
function timeLabel(date: Readonly<Date>): string {
  return TIME_LABEL.format(date);
}

/**
 * A calendar date.
 *
 * @param iso - e.g. `"2026-03-18"`
 * @returns The PlainDate
 */
function plainDate(iso: string): PlainDate {
  return temporal().PlainDate.from(iso);
}

/**
 * Now, in the browser's zone.
 *
 * @returns The current moment
 */
function now(): ZonedDateTime {
  return temporal().Now.zonedDateTimeISO();
}

/**
 * A Temporal date as "Sat, Jan 31, 2026", a moment as "Jan 31, 2026, 23:59:59"
 * in its own zone.
 *
 * @param value - A date or a moment
 * @returns The label
 */
function valueLabel(value: PlainDate | ZonedDateTime): string {
  if ("hour" in value) {
    return value.toLocaleString("en-US", TIME_OPTIONS);
  }
  return value.toLocaleString("en-US", DAY_OPTIONS);
}

/** A value fechita reads: a date, a wall clock, or an instant. */
type ReadValue =
  | Readonly<Temporal.PlainDate>
  | Readonly<Temporal.PlainDateTime>
  | Readonly<Temporal.Instant>;

/**
 * A value fechita read as "Sat, Jan 31, 2026", an instant's day in the
 * browser's zone.
 *
 * @param value - The value
 * @returns The label
 */
function readDayLabel(value: ReadValue): string {
  return value.toLocaleString("en-US", DAY_OPTIONS);
}

/**
 * A value fechita read with its time when it has one: a date as "Sat, Jan
 * 31, 2026", a wall clock or an instant as "Jan 31, 2026, 23:59:59", the
 * instant in the browser's zone.
 *
 * @param value - The value
 * @returns The label
 */
function readLabel(value: ReadValue): string {
  if ("hour" in value || !("day" in value)) {
    return value.toLocaleString("en-US", TIME_OPTIONS);
  }
  return value.toLocaleString("en-US", DAY_OPTIONS);
}

/**
 * The calendar date an `<input type="date">` holds, or undefined while empty.
 *
 * @param input - The date input
 * @returns Its date
 */
function inputPlainDate(input: HTMLInputElement): PlainDate | undefined {
  if (input.value === "") {
    return undefined;
  }
  return plainDate(input.value);
}

/**
 * The local date an `<input type="date">` holds, or undefined while empty.
 *
 * @param input - The date input
 * @returns Local midnight of its day
 */
function inputDate(input: HTMLInputElement): Date | undefined {
  if (input.value === "") {
    return undefined;
  }
  return new Date(`${input.value}T00:00:00`);
}

export {
  dayLabel,
  demoRoots,
  fillList,
  inputDate,
  inputPlainDate,
  now,
  part,
  plainDate,
  readDayLabel,
  readLabel,
  timeLabel,
  valueLabel,
};
export type { ReadValue };
