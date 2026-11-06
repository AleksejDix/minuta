import {
  deriveFormat,
  fromTemporal,
  segmentsToString,
} from "@aleksejdix/datefield";
import { render, screen } from "@testing-library/react";
import { DateFieldInput } from "./DateFieldInput";
import { DateFieldRoot } from "./DateFieldRoot";
import { Temporal } from "temporal-polyfill";
import { act } from "react";
import { vi } from "vitest";

const LABEL = "Date";

type Field = Readonly<{
  /** The date the field last reported, `undefined` while incomplete */
  date: () => Readonly<Temporal.PlainDate> | undefined;
  input: HTMLInputElement;
}>;

/**
 * Render the demo's date field and track the date it reports.
 *
 * @param locale - Locale that decides the format
 * @param value - Initial date
 * @returns The input and the last reported date
 */
function renderField(
  locale: string,
  value?: Readonly<Temporal.PlainDate>
): Field {
  const report =
    vi.fn<(date: Readonly<Temporal.PlainDate> | undefined) => void>();
  render(
    <DateFieldRoot locale={locale} onChange={report} value={value}>
      <DateFieldInput label={LABEL} />
    </DateFieldRoot>
  );
  const input = screen.getByLabelText(LABEL);
  if (!(input instanceof HTMLInputElement)) {
    throw new TypeError("Expected the field's input");
  }
  return {
    date: () => {
      const last = report.mock.lastCall;
      if (last === undefined) {
        return value;
      }
      const [date] = last;
      return date;
    },
    input,
  };
}

function beforeInput(
  input: HTMLInputElement,
  inputType: string,
  data = ""
): void {
  act(() => {
    input.dispatchEvent(
      new InputEvent("beforeinput", {
        bubbles: true,
        cancelable: true,
        data,
        inputType,
      })
    );
  });
}

function typeText(input: HTMLInputElement, text: string): void {
  for (const char of text) {
    beforeInput(input, "insertText", char);
  }
}

function pasteText(input: HTMLInputElement, text: string): void {
  beforeInput(input, "insertFromPaste", text);
}

function backspace(input: HTMLInputElement): void {
  beforeInput(input, "deleteContentBackward");
}

function select(input: HTMLInputElement, start: number, end = start): void {
  act(() => {
    input.setSelectionRange(start, end);
    input.dispatchEvent(new Event("select"));
  });
}

function pressKey(input: HTMLInputElement, key: string): void {
  act(() => {
    input.dispatchEvent(
      new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key })
    );
  });
}

/**
 * A calendar day, e.g. `localDay("2026-10-28")`.
 *
 * @param iso - The day as `YYYY-MM-DD`
 * @returns The day
 */
function localDay(iso: string): Temporal.PlainDate {
  return Temporal.PlainDate.from(iso);
}

/**
 * The text the field shows for a date.
 *
 * @param locale - Locale that decides the format
 * @param date - The date
 * @returns The formatted field text
 */
function shown(locale: string, date: Readonly<Temporal.PlainDate>): string {
  return segmentsToString(fromTemporal(date, deriveFormat(locale), locale));
}

export {
  backspace,
  beforeInput,
  localDay,
  pasteText,
  pressKey,
  renderField,
  select,
  shown,
  typeText,
};
export type { Field };
