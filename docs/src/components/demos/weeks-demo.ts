/**
 * Weeks and calendars: a hand-made month grid always starts on Sunday with a
 * Saturday–Sunday weekend; minuta's grid follows the week start and weekend
 * you choose, or the locale's.
 */
import { demoRoots, part } from "./dom";
import { isWeekendWith, monthGridWith } from "minuta/calendar";
import type { Period } from "minuta";
import type { WeekdayNumber } from "minuta/core";
import { nativeUnits } from "minuta/native";

type Cell = Readonly<{ day: number; outside: boolean; weekend: boolean }>;
type WeekInfo = Readonly<{ firstDay: number; weekend: readonly number[] }>;
type Settings = Readonly<{
  weekStartsOn: WeekdayNumber;
  weekend: readonly WeekdayNumber[];
}>;

const DAYS_A_WEEK = 7;
const SUNDAY = 0;
const FRIDAY = 5;
const SATURDAY = 6;
const ONE = 1;
const FIRST = 0;
const NAIVE_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const LOCALE_SETTING = "locale";
// Where the runtime has no Intl week info: ISO weeks, Saturday + Sunday
const DEFAULT_SETTINGS: Settings = {
  weekStartsOn: ONE,
  weekend: [SATURDAY, SUNDAY],
};

const WEEKENDS: ReadonlyMap<string, readonly WeekdayNumber[]> = new Map<
  string,
  readonly WeekdayNumber[]
>([
  ["sat-sun", [SATURDAY, SUNDAY]],
  ["fri-sat", [FRIDAY, SATURDAY]],
  ["fri", [FRIDAY]],
  ["sun", [SUNDAY]],
  ["none", []],
]);

function isWeekdayNumber(day: number): day is WeekdayNumber {
  return Number.isInteger(day) && day >= SUNDAY && day <= SATURDAY;
}

// Monday for anything that is not a day number
function toWeekday(day: number): WeekdayNumber {
  if (isWeekdayNumber(day)) {
    return day;
  }
  return ONE;
}

function isWeekInfo(value: unknown): value is WeekInfo {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof Reflect.get(value, "firstDay") === "number" &&
    Array.isArray(Reflect.get(value, "weekend"))
  );
}

// Intl numbers days 1 = Monday … 7 = Sunday; minuta 0 = Sunday … 6 = Saturday
function localeSettings(tag: string): Settings {
  const locale = new Intl.Locale(tag);
  const read: unknown = Reflect.get(locale, "getWeekInfo");
  if (typeof read !== "function") {
    return DEFAULT_SETTINGS;
  }
  const info: unknown = Reflect.apply(read, locale, []);
  if (!isWeekInfo(info)) {
    return DEFAULT_SETTINGS;
  }
  return {
    weekStartsOn: toWeekday(info.firstDay % DAYS_A_WEEK),
    weekend: info.weekend.map((day) => toWeekday(day % DAYS_A_WEEK)),
  };
}

function weekStart(value: string, fromLocale: Settings): WeekdayNumber {
  if (value === LOCALE_SETTING) {
    return fromLocale.weekStartsOn;
  }
  return toWeekday(Number(value));
}

function settingsOf(root: HTMLElement, tag: string): Settings {
  const fromLocale = localeSettings(tag);
  const start = part(root, "start", HTMLSelectElement).value;
  const weekend = WEEKENDS.get(part(root, "weekend", HTMLSelectElement).value);
  return {
    weekStartsOn: weekStart(start, fromLocale),
    weekend: weekend ?? fromLocale.weekend,
  };
}

function monthOf(input: HTMLInputElement): Date {
  return new Date(`${input.value || "2026-03"}-01T00:00:00`);
}

// The usual hand-made grid: blanks for getDay(), then the days
function naiveCells(month: Readonly<Date>): Cell[] {
  const blanks = new Date(month.getFullYear(), month.getMonth(), ONE).getDay();
  const days = new Date(
    month.getFullYear(),
    month.getMonth() + ONE,
    FIRST
  ).getDate();
  return Array.from({ length: blanks + days }, (_unused, index) => {
    const day = index - blanks + ONE;
    const weekday = index % DAYS_A_WEEK;
    return {
      day: Math.max(day, FIRST),
      outside: day < ONE,
      weekend: weekday === SUNDAY || weekday === SATURDAY,
    };
  });
}

function minutaCells(
  units: ReturnType<typeof nativeUnits>,
  month: Readonly<Date>
): Cell[] {
  return monthGridWith(units, month).periods.map((day: Period) => ({
    day: day.start.getDate(),
    outside: day.start.getMonth() !== month.getMonth(),
    weekend: isWeekendWith(units, day),
  }));
}

function headersOf(
  units: ReturnType<typeof nativeUnits>,
  month: Readonly<Date>,
  tag: string
): string[] {
  const weekday = new Intl.DateTimeFormat(tag, { weekday: "short" });
  return monthGridWith(units, month)
    .periods.slice(FIRST, DAYS_A_WEEK)
    .map((day) => weekday.format(day.start));
}

// The hand-made grid leaves the days before the 1st blank
function cellText(cell: Cell): string {
  if (cell.outside && cell.day === FIRST) {
    return "";
  }
  return String(cell.day);
}

function cellElement(cell: Cell): HTMLTableCellElement {
  const element = document.createElement("td");
  element.className = "h-8 w-9 rounded-md text-center text-sm";
  element.textContent = cellText(cell);
  element.classList.toggle("text-muted-foreground", cell.outside);
  element.classList.toggle("bg-accent", cell.weekend && !cell.outside);
  element.classList.toggle("font-semibold", cell.weekend);
  return element;
}

function renderGrid(
  table: HTMLElement,
  headers: readonly string[],
  cells: readonly Cell[]
): void {
  const head = document.createElement("tr");
  head.replaceChildren(
    ...headers.map((text) => {
      const th = document.createElement("th");
      th.className = "h-8 w-9 text-xs font-normal text-muted-foreground";
      th.textContent = text;
      return th;
    })
  );
  const rows = Array.from(
    { length: Math.ceil(cells.length / DAYS_A_WEEK) },
    (_unused, row) => {
      const tr = document.createElement("tr");
      tr.replaceChildren(
        ...cells
          .slice(row * DAYS_A_WEEK, (row + ONE) * DAYS_A_WEEK)
          .map((cell) => cellElement(cell))
      );
      return tr;
    }
  );
  table.replaceChildren(head, ...rows);
}

function show(root: HTMLElement): void {
  const tag = part(root, "locale", HTMLSelectElement).value;
  const month = monthOf(part(root, "month", HTMLInputElement));
  const settings = settingsOf(root, tag);
  const units = nativeUnits(settings);
  renderGrid(
    part(root, "naive", HTMLElement),
    NAIVE_HEADERS,
    naiveCells(month)
  );
  renderGrid(
    part(root, "grid", HTMLElement),
    headersOf(units, month, tag),
    minutaCells(units, month)
  );
  part(root, "settings", HTMLElement).textContent =
    `nativeUnits({ weekStartsOn: ${String(settings.weekStartsOn)}, weekend: [${settings.weekend.join(", ")}] })`;
}

/**
 * Wire up every weeks demo on the page.
 */
function mountWeeksDemos(): void {
  for (const root of demoRoots("weeks")) {
    for (const name of ["locale", "start", "weekend", "month"]) {
      part(root, name, HTMLElement).addEventListener("input", () => {
        show(root);
      });
    }
    show(root);
  }
}

export { mountWeeksDemos };
