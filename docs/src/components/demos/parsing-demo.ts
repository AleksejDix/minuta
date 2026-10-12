/**
 * Parsing dates: `new Date(text)` gives up or silently guesses; fechita reads
 * dates in any language and reports ambiguity instead of guessing.
 */
import { dayLabel, demoRoots, fillList, part, timeLabel } from "./dom";
import type { Order } from "fechita";
import { parseDate } from "fechita";

// What fechita said, as read-only data
type Reading = Readonly<{
  candidates: readonly Readonly<Date>[];
  codes: readonly string[];
  date: Readonly<Date> | undefined;
}>;

const ORDERS: ReadonlySet<string> = new Set(["DMY", "MDY", "YMD"]);
const NONE = 0;

function isOrder(value: string): value is Order {
  return ORDERS.has(value);
}

function parsed(text: string, order: string): ReturnType<typeof parseDate> {
  if (isOrder(order)) {
    return parseDate(text, { order });
  }
  return parseDate(text);
}

function reading(text: string, order: string): Reading {
  const result = parsed(text, order);
  if (result.valid) {
    return { candidates: [], codes: [], date: result.date };
  }
  return {
    candidates: result.candidates,
    codes: result.errorCodes,
    date: undefined,
  };
}

function sameDay(left: Readonly<Date>, right: Readonly<Date>): boolean {
  return dayLabel(left) === dayLabel(right);
}

function naiveVerdict(naive: Readonly<Date>, read: Reading): string {
  if (Number.isNaN(naive.getTime())) {
    return "✗ new Date() gives up.";
  }
  if (read.candidates.length > NONE) {
    return "✗ new Date() picked one reading and did not tell you there are others.";
  }
  if (read.date === undefined) {
    return "✗ new Date() accepted text that is not a valid date.";
  }
  if (sameDay(naive, read.date)) {
    return "This one new Date() reads right too. Try another.";
  }
  return "✗ new Date() read a different day.";
}

function naiveText(naive: Readonly<Date>): string {
  if (Number.isNaN(naive.getTime())) {
    return "Invalid Date";
  }
  return timeLabel(naive);
}

function showNaive(root: HTMLElement, text: string, read: Reading): void {
  const naive = new Date(text);
  part(root, "naive", HTMLElement).textContent = naiveText(naive);
  part(root, "naive-verdict", HTMLElement).textContent = naiveVerdict(
    naive,
    read
  );
}

function showReading(root: HTMLElement, read: Reading): void {
  const result = part(root, "result", HTMLElement);
  if (read.date === undefined) {
    result.textContent = `not valid: ${read.codes.join(", ")}`;
  } else {
    result.textContent = `✓ valid: ${timeLabel(read.date)}`;
  }
  fillList(
    part(root, "candidates", HTMLElement),
    read.candidates.map((candidate) => `could be ${dayLabel(candidate)}`)
  );
}

function show(root: HTMLElement): void {
  const text = part(root, "text", HTMLInputElement).value;
  const read = reading(text, part(root, "order", HTMLSelectElement).value);
  showNaive(root, text, read);
  showReading(root, read);
}

/**
 * Wire up every parsing demo on the page.
 */
function mountParsingDemos(): void {
  for (const root of demoRoots("parsing")) {
    const input = part(root, "text", HTMLInputElement);
    input.addEventListener("input", () => {
      show(root);
    });
    part(root, "order", HTMLSelectElement).addEventListener("change", () => {
      show(root);
    });
    for (const button of root.querySelectorAll<HTMLButtonElement>(
      "[data-preset]"
    )) {
      button.addEventListener("click", () => {
        input.value = button.dataset["preset"] ?? "";
        show(root);
      });
    }
    show(root);
  }
}

export { mountParsingDemos };
