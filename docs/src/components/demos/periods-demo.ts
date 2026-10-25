/**
 * Periods and units: month math on a Date skips months, `next` on a period
 * does not; then explore any period, step it and split it.
 */
import type { Period, Unit } from "@aleksejdix/minuta";
import {
  dayLabel,
  demoRoots,
  fillList,
  inputDate,
  part,
  timeLabel,
} from "./dom";
import {
  divide,
  next as nextPeriod,
  period,
  previous as previousPeriod,
} from "@aleksejdix/minuta";

const DAYS_BY_HAND = 30;
const MONTHS = 12;
const SHOWN_PIECES = 12;
const FIRST = 0;
const ONE = 1;

const SMALLER: ReadonlyMap<Unit, readonly Unit[]> = new Map<Unit, Unit[]>([
  ["day", ["hour"]],
  ["month", ["week", "day"]],
  ["quarter", ["month", "week", "day"]],
  ["week", ["day", "hour"]],
  ["year", ["quarter", "month", "week", "day"]],
]);
const UNITS: ReadonlySet<string> = new Set([...SMALLER.keys(), "hour"]);

function isUnit(value: string): value is Unit {
  return UNITS.has(value);
}

function unitNamed(value: string): Unit {
  if (isUnit(value)) {
    return value;
  }
  return "day";
}

function span(piece: Period): string {
  return `${timeLabel(piece.start)} → ${timeLabel(piece.end)}`;
}

function verdict(date: Readonly<Date>, plusMonth: Readonly<Date>): string {
  if (plusMonth.getMonth() === (date.getMonth() + ONE) % MONTHS) {
    return "This date happens to work. Try Jan 31, Mar 31 or Aug 31.";
  }
  return `✗ That is not next month: ${dayLabel(date)} plus one month skipped a whole month.`;
}

// What people write: add a month to the Date, or add 30 days
function showProblem(root: HTMLElement, date: Readonly<Date>): void {
  const plusMonth = new Date(date);
  plusMonth.setMonth(plusMonth.getMonth() + ONE);
  const plusDays = new Date(date);
  plusDays.setDate(plusDays.getDate() + DAYS_BY_HAND);
  part(root, "plus-month", HTMLElement).textContent = dayLabel(plusMonth);
  part(root, "plus-days", HTMLElement).textContent = dayLabel(plusDays);
  part(root, "verdict", HTMLElement).textContent = verdict(date, plusMonth);
}

function showAnswer(root: HTMLElement, date: Readonly<Date>): void {
  const month = nextPeriod(period(date, "month"));
  part(root, "next-month", HTMLElement).textContent =
    `${dayLabel(month.start)} – ${dayLabel(month.end)}`;
}

function pieceLabels(pieces: readonly Period[]): string[] {
  const labels = pieces
    .slice(FIRST, SHOWN_PIECES)
    .map((piece) => `${piece.unit}: ${span(piece)}`);
  if (pieces.length > SHOWN_PIECES) {
    labels.push(`… ${String(pieces.length - SHOWN_PIECES)} more`);
  }
  return labels;
}

function showPeriod(root: HTMLElement, current: Period): void {
  const sub = part(root, "sub", HTMLSelectElement).value;
  const pieces = divide(current, unitNamed(sub));
  part(root, "period", HTMLElement).textContent = span(current);
  part(root, "unit-name", HTMLElement).textContent = current.unit;
  part(root, "count", HTMLElement).textContent =
    `${String(pieces.length)} × ${sub}`;
  fillList(part(root, "pieces", HTMLElement), pieceLabels(pieces));
}

function fillSubUnits(root: HTMLElement, unit: Unit): void {
  part(root, "sub", HTMLSelectElement).replaceChildren(
    ...(SMALLER.get(unit) ?? []).map((name) => new Option(name, name))
  );
}

// The explorer's period, stepped with the buttons
function mountExplorer(root: HTMLElement): (date: Readonly<Date>) => void {
  let current: Period = period(new Date(), "month");
  part(root, "previous", HTMLButtonElement).addEventListener("click", () => {
    current = previousPeriod(current);
    showPeriod(root, current);
  });
  part(root, "next", HTMLButtonElement).addEventListener("click", () => {
    current = nextPeriod(current);
    showPeriod(root, current);
  });
  part(root, "sub", HTMLSelectElement).addEventListener("change", () => {
    showPeriod(root, current);
  });
  return (date) => {
    const unit = unitNamed(part(root, "unit", HTMLSelectElement).value);
    fillSubUnits(root, unit);
    current = period(date, unit);
    showPeriod(root, current);
  };
}

function mount(root: HTMLElement): void {
  const dateInput = part(root, "date", HTMLInputElement);
  const explore = mountExplorer(root);
  function update(): void {
    const date = inputDate(dateInput) ?? new Date();
    showProblem(root, date);
    showAnswer(root, date);
    explore(date);
  }
  dateInput.addEventListener("input", update);
  part(root, "unit", HTMLSelectElement).addEventListener("change", update);
  update();
}

/**
 * Wire up every periods demo on the page.
 */
function mountPeriodsDemos(): void {
  for (const root of demoRoots("periods")) {
    mount(root);
  }
}

export { mountPeriodsDemos };
