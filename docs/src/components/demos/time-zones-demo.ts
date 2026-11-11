/**
 * Time zones: "a day is 24 hours" and `getHours()` break on clock-change
 * days and in other zones; units in a zone get the real day.
 */
import type { PlainDate, ZonedDateTime } from "@aleksejdix/minuta";
import { createUnits, withUnits } from "@aleksejdix/minuta";
import { demoRoots, part, plainDate } from "./dom";

const HOUR_MS = 3_600_000;
const HOURS_A_DAY = 24;
const MIDNIGHT = "00:00";

function clock(date: Readonly<Date>, timeZone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    hourCycle: "h23",
    minute: "2-digit",
    timeZone,
  }).format(date);
}

function dateAndClock(date: Readonly<Date>, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    hour: "2-digit",
    hourCycle: "h23",
    minute: "2-digit",
    month: "short",
    timeZone,
    weekday: "short",
  }).format(date);
}

// The calendar date the input holds
function dateOf(input: HTMLInputElement): PlainDate {
  return plainDate(input.value || "2026-03-29");
}

// A moment as the Date the hand-written code would hold
function asDate(moment: ZonedDateTime): Date {
  return new Date(moment.epochMilliseconds);
}

function naiveVerdict(
  next: Readonly<Date>,
  timeZone: string,
  hours: number
): string {
  if (clock(next, timeZone) === MIDNIGHT) {
    return "This day happens to have 24 hours. Try Mar 29 in Europe/Zurich, Mar 8 in New York or Apr 5 in Sydney.";
  }
  return `✗ The next day starts at midnight, not at ${clock(next, timeZone)}: this day has ${String(hours)} hours.`;
}

function browserZone(): string {
  return new Intl.DateTimeFormat().resolvedOptions().timeZone;
}

// What people write: add 24 hours, read the hour off the Date
function showProblem(
  root: HTMLElement,
  dayStart: Readonly<Date>,
  view: Readonly<{ hours: number; timeZone: string }>
): void {
  const next = new Date(dayStart.getTime() + HOURS_A_DAY * HOUR_MS);
  part(root, "naive-next", HTMLElement).textContent = dateAndClock(
    next,
    view.timeZone
  );
  part(root, "naive-hours", HTMLElement).textContent =
    `${String(new Date(dayStart).getHours())} (your browser's zone, ${browserZone()})`;
  part(root, "verdict", HTMLElement).textContent = naiveVerdict(
    next,
    view.timeZone,
    view.hours
  );
}

function show(root: HTMLElement): void {
  const timeZone = part(root, "zone", HTMLSelectElement).value;
  const time = withUnits(createUnits({ timeZone }));
  const day = time.day(dateOf(part(root, "date", HTMLInputElement)));
  const hours = time.count(day, "hour");
  // The day as moments in the zone: from its start to the next day's
  const start = day.start.toZonedDateTime({ timeZone });
  const end = day.end.toZonedDateTime({ timeZone });
  showProblem(root, asDate(start), { hours, timeZone });
  part(root, "span", HTMLElement).textContent =
    `${dateAndClock(asDate(start), timeZone)} → ${dateAndClock(asDate(end), timeZone)}`;
  part(root, "hours", HTMLElement).textContent = String(hours);
  part(root, "clock", HTMLElement).textContent = time
    .divide(day, "hour")
    .map((hour) => clock(asDate(hour.start), timeZone))
    .join("  ");
}

/**
 * Wire up every time-zones demo on the page.
 */
function mountTimeZonesDemos(): void {
  for (const root of demoRoots("time-zones")) {
    part(root, "zone", HTMLSelectElement).addEventListener("change", () => {
      show(root);
    });
    part(root, "date", HTMLInputElement).addEventListener("input", () => {
      show(root);
    });
    show(root);
  }
}

export { mountTimeZonesDemos };
