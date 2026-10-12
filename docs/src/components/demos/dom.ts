/**
 * Small DOM helpers the concept demos share: find a demo's parts, show text,
 * label dates.
 */

const DAY_LABEL = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  weekday: "short",
  year: "numeric",
});

const TIME_LABEL = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  hour: "2-digit",
  hourCycle: "h23",
  minute: "2-digit",
  month: "short",
  second: "2-digit",
  year: "numeric",
});

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

export { dayLabel, demoRoots, fillList, inputDate, part, timeLabel };
