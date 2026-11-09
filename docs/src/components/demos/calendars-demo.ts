/**
 * Calendar systems: a `Date` knows only the Gregorian calendar; minuta's
 * periods follow the calendar you pick, with its months, quarters and labels.
 */
import type { DatePeriod, Minuta, PlainDate } from "@aleksejdix/minuta";
import {
  createUnits,
  range,
  toLocaleString,
  withUnits,
} from "@aleksejdix/minuta";
import { demoRoots, fillList, inputPlainDate, part, plainDate } from "./dom";

const DAYS_A_WEEK = 7;
const ONE = 1;
const FIRST = 0;
const FALLBACK = "2026-03-18";
const ENGLISH = "en-US";

// A locale that writes each calendar natively
const NATIVE: ReadonlyMap<string, string> = new Map([
  ["buddhist", "th-TH"],
  ["chinese", "zh-CN"],
  ["coptic", "ar-EG"],
  ["dangi", "ko-KR"],
  ["ethiopic", "am-ET"],
  ["hebrew", "he-IL"],
  ["indian", "hi-IN"],
  ["islamic-civil", "ar-EG"],
  ["islamic-umalqura", "ar-SA"],
  ["japanese", "ja-JP"],
  ["persian", "fa-IR"],
  ["roc", "zh-TW"],
]);

function dateOf(root: HTMLElement): PlainDate {
  return (
    inputPlainDate(part(root, "date", HTMLInputElement)) ?? plainDate(FALLBACK)
  );
}

function cell(text: string, outside: boolean): HTMLTableCellElement {
  const element = document.createElement("td");
  element.className = "h-8 w-9 rounded-md text-center text-sm";
  element.textContent = text;
  element.classList.toggle("text-muted-foreground", outside);
  return element;
}

function header(text: string): HTMLTableCellElement {
  const element = document.createElement("th");
  element.className = "h-8 w-9 text-xs font-normal text-muted-foreground";
  element.textContent = text;
  return element;
}

// The month grid, numbered in the calendar: day 1 is the calendar's 1st
function renderGrid(table: HTMLElement, time: Minuta, date: PlainDate): void {
  const { monthStart, periods } = time.monthGrid(date);
  const head = document.createElement("tr");
  head.replaceChildren(
    ...periods
      .slice(FIRST, DAYS_A_WEEK)
      .map((day) => header(toLocaleString(day, ENGLISH, { weekday: "short" })))
  );
  const rows = Array.from(
    { length: periods.length / DAYS_A_WEEK },
    (_unused, row) => {
      const tr = document.createElement("tr");
      tr.replaceChildren(
        ...periods
          .slice(row * DAYS_A_WEEK, (row + ONE) * DAYS_A_WEEK)
          .map((day) =>
            cell(
              String(day.start.day),
              day.start.monthCode !== monthStart.monthCode
            )
          )
      );
      return tr;
    }
  );
  table.replaceChildren(head, ...rows);
}

function quarterLines(quarters: readonly DatePeriod[]): string[] {
  return quarters.map((quarter) => {
    const { months } = quarter.start.until(quarter.end, {
      largestUnit: "month",
    });
    return `${toLocaleString(range(quarter.start, quarter.end), ENGLISH, { month: "long", year: "numeric" })} (${String(months)} months)`;
  });
}

function showLabels(
  root: HTMLElement,
  month: DatePeriod,
  calendar: string
): void {
  const locale = NATIVE.get(calendar) ?? ENGLISH;
  const native = part(root, "native", HTMLElement);
  part(root, "label", HTMLElement).textContent = toLocaleString(month, ENGLISH);
  native.lang = locale;
  native.textContent = ` · ${toLocaleString(month, locale)}`;
}

function showResult(root: HTMLElement, calendar: string): void {
  const time = withUnits(createUnits({ calendar }));
  const date = dateOf(root);
  const month = time.period(date, "month");
  const year = time.period(date, "year");
  showLabels(root, month, calendar);
  renderGrid(part(root, "grid", HTMLElement), time, date);
  part(root, "facts", HTMLElement).textContent =
    `${String(time.count(month, "day"))} days this month · ${String(year.start.monthsInYear)} months this year`;
  fillList(
    part(root, "quarters", HTMLElement),
    quarterLines(time.divide(year, "quarter"))
  );
}

// What a Date grid shows: the Gregorian month, numbered from 0
function showNaive(root: HTMLElement, calendar: string): void {
  const date = dateOf(root);
  const gregorian = withUnits(createUnits()).period(date, "month");
  part(root, "naive", HTMLElement).textContent =
    `new Date(${String(date.year)}, ${String(date.month - ONE)}, ${String(date.day)}).getMonth()  → ${String(date.month - ONE)} (${toLocaleString(gregorian, ENGLISH)})`;
  part(root, "code", HTMLElement).textContent =
    `withUnits(createUnits({ calendar: "${calendar}" })).period(date, "month")`;
}

function show(root: HTMLElement): void {
  const { value: calendar } = part(root, "calendar", HTMLSelectElement);
  showNaive(root, calendar);
  showResult(root, calendar);
}

// Move the date input a month on, in the picked calendar
function step(root: HTMLElement, months: number): void {
  const calendar = part(root, "calendar", HTMLSelectElement).value;
  const input = part(root, "date", HTMLInputElement);
  const moved = dateOf(root).withCalendar(calendar).add({ months });
  input.value = moved.withCalendar("iso8601").toString();
  show(root);
}

/**
 * Wire up every calendars demo on the page.
 */
function mountCalendarsDemos(): void {
  for (const root of demoRoots("calendars")) {
    for (const name of ["calendar", "date"]) {
      part(root, name, HTMLElement).addEventListener("input", () => {
        show(root);
      });
    }
    part(root, "previous", HTMLElement).addEventListener("click", () => {
      step(root, -ONE);
    });
    part(root, "next", HTMLElement).addEventListener("click", () => {
      step(root, ONE);
    });
    show(root);
  }
}

export { mountCalendarsDemos };
