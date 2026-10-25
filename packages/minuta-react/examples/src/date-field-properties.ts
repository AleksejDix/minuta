import {
  DATES,
  EDGE_DATES,
  isoDate,
  sameDay,
  writtenForms,
} from "./date-field-dates";
import {
  pasteText,
  pressKey,
  renderField,
  select,
  shown,
  typeText,
} from "./date-field-test-utils";
import { cleanup } from "@testing-library/react";
import { deriveFormat } from "@aleksejdix/datefield";

const DAY_STEPS = 40;
const ONE = 1;

function tokenWidth(
  token: Readonly<ReturnType<typeof deriveFormat>[number]>
): number {
  if (token.type === "literal") {
    return token.char.length;
  }
  return token.length;
}

// Where the day segment starts in the field's text
function dayStart(locale: string): number {
  let position = 0;
  for (const token of deriveFormat(locale)) {
    if (token.type === "day") {
      return position;
    }
    position += tokenWidth(token);
  }
  throw new RangeError(`No day segment in ${locale}`);
}

/**
 * Pastes every written form of many dates.
 *
 * @param locale - Locale of the field
 * @returns The pastes not read as their date
 */
function misreadPastes(locale: string): string[] {
  const field = renderField(locale);
  const misread: string[] = [];
  for (const date of DATES) {
    for (const text of writtenForms(locale, date)) {
      pasteText(field.input, text);
      if (
        field.input.value !== shown(locale, date) ||
        !sameDay(field.date(), date)
      ) {
        misread.push(`${text} → ${field.input.value}`);
      }
    }
  }
  cleanup();
  return misread;
}

/**
 * Types the text the field shows for many dates, key by key.
 *
 * @param locale - Locale of the field
 * @returns The texts not typed back to their date
 */
function mistypedDates(locale: string): string[] {
  const mistyped: string[] = [];
  for (const date of DATES) {
    const field = renderField(locale);
    typeText(field.input, shown(locale, date));
    if (!sameDay(field.date(), date)) {
      mistyped.push(`${shown(locale, date)} → ${field.input.value}`);
    }
    cleanup();
  }
  return mistyped;
}

/**
 * Copies the field's text and pastes it back for many dates.
 *
 * @param locale - Locale of the field
 * @returns The values a copy and paste changed
 */
function repastedChanges(locale: string): string[] {
  const field = renderField(locale);
  const changed: string[] = [];
  for (const date of DATES) {
    pasteText(field.input, isoDate(date));
    const before = field.input.value;
    pasteText(field.input, before);
    if (field.input.value !== before) {
      changed.push(`${before} → ${field.input.value}`);
    }
  }
  cleanup();
  return changed;
}

function pressTimes(input: HTMLInputElement, key: string): void {
  for (let step = 0; step < DAY_STEPS; step += ONE) {
    pressKey(input, key);
  }
}

// The field's text after stepping the day up and back down as often
function steppedBack(input: HTMLInputElement, dayInside: number): string {
  select(input, dayInside);
  pressTimes(input, "ArrowUp");
  pressTimes(input, "ArrowDown");
  return input.value;
}

// The change stepping the day up and back down made to a date, if any
function driftFrom(
  input: HTMLInputElement,
  dayInside: number,
  date: Readonly<Date>
): string[] {
  pasteText(input, isoDate(date));
  const before = input.value;
  const after = steppedBack(input, dayInside);
  if (after === before) {
    return [];
  }
  return [`${before} → ${after}`];
}

/**
 * Steps the day up and back down as often for the edge dates.
 *
 * @param locale - Locale of the field
 * @returns The values that did not come back
 */
function dayStepDrift(locale: string): string[] {
  const field = renderField(locale);
  const dayInside = dayStart(locale) + ONE;
  const drifted = EDGE_DATES.flatMap((date: Readonly<Date>) =>
    driftFrom(field.input, dayInside, date)
  );
  cleanup();
  return drifted;
}

export { dayStepDrift, misreadPastes, mistypedDates, repastedChanges };
