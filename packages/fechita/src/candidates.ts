/**
 * Every reading of the numbers in a date: year, month and day in each order
 * the text allows. Readings that name no real day are dropped later.
 */

import type { Order } from "./types";

const FOUR_DIGITS = 4;
const EIGHT_DIGITS = 8;
const TWO_DIGITS = 2;
const THREE_DIGITS = 3;
const MAX_DAY = 31;
const CENTURY = 100;
const YEARS_BEFORE = 80;
const YEAR_DIGITS = 4;
const MONTH_DIGITS = 2;
const ONE_GROUP = 1;
const START = 0;
const LAST = -1;

/** One reading of the numbers: the year still as written. */
type Reading = Readonly<{
  day: number;
  month: number;
  order: Order;
  year: number;
}>;

const ORDERS: readonly Order[] = ["YMD", "DMY", "MDY"];

/**
 * The full year a written year stands for: two digits in a window from 80
 * years before the reference to 19 after; other years as written.
 *
 * @param written - The digits of the year
 * @param reference - Reference date for two-digit years
 * @returns The full year
 */
function fullYear(written: string, reference: Readonly<Date>): number {
  const value = Number(written);
  if (written.length !== TWO_DIGITS) {
    return value;
  }
  const start = reference.getFullYear() - YEARS_BEFORE;
  return start + ((((value - start) % CENTURY) + CENTURY) % CENTURY);
}

function readingIn(
  groups: readonly string[],
  order: Order,
  reference: Readonly<Date>
): Reading | undefined {
  const [first = "", second = "", third = ""] = groups;
  const byOrder: Readonly<Record<Order, readonly [string, string, string]>> = {
    DMY: [third, second, first],
    MDY: [third, first, second],
    YMD: [first, second, third],
  };
  const [year, month, day] = byOrder[order];
  // A year is written with two or four digits; a day or month with one or two
  if (
    ![TWO_DIGITS, FOUR_DIGITS].includes(year.length) ||
    month.length > TWO_DIGITS ||
    day.length > TWO_DIGITS
  ) {
    return undefined;
  }
  return {
    day: Number(day),
    month: Number(month),
    order,
    year: fullYear(year, reference),
  };
}

// "20260331", "31032026" or "03312026": one run of eight digits
function splitEight(group: string, order: Order): readonly string[] {
  if (order === "YMD") {
    return [
      group.slice(START, YEAR_DIGITS),
      group.slice(YEAR_DIGITS, YEAR_DIGITS + MONTH_DIGITS),
      group.slice(YEAR_DIGITS + MONTH_DIGITS),
    ];
  }
  return [
    group.slice(START, MONTH_DIGITS),
    group.slice(MONTH_DIGITS, MONTH_DIGITS * TWO_DIGITS),
    group.slice(MONTH_DIGITS * TWO_DIGITS),
  ];
}

function groupsFor(groups: readonly string[], order: Order): readonly string[] {
  const [only] = groups;
  if (
    groups.length === ONE_GROUP &&
    only !== undefined &&
    only.length === EIGHT_DIGITS
  ) {
    return splitEight(only, order);
  }
  return groups;
}

/**
 * The readings of numbers without a month name.
 *
 * @param groups - The runs of digits in the text, in order
 * @param reference - Reference date for two-digit years
 * @returns One reading per order that fits the digits
 */
function numericReadings(
  groups: readonly string[],
  reference: Readonly<Date>
): Reading[] {
  return ORDERS.flatMap((order) =>
    [readingIn(groupsFor(groups, order), order, reference)].filter(
      (reading) => reading !== undefined
    )
  );
}

// The year next to a month name: three or four digits, a two-digit number
// Above 31 after the first, or else the last number
function namedYear(groups: readonly string[]): string | undefined {
  return (
    groups.find((group) => group.length >= THREE_DIGITS) ??
    groups.find(
      (group, index) =>
        index > START && group.length === TWO_DIGITS && Number(group) > MAX_DAY
    ) ??
    groups.at(LAST)
  );
}

/**
 * The readings of numbers next to a month name: the day and the year.
 *
 * @param groups - The runs of digits in the text, in order
 * @param month - The named month, 1–12
 * @param reference - Reference date for two-digit years
 * @returns The readings
 */
function namedReadings(
  groups: readonly string[],
  month: number,
  reference: Readonly<Date>
): Reading[] {
  const year = namedYear(groups);
  const day = groups.find(
    (group) => group !== year && group.length <= TWO_DIGITS
  );
  if (year === undefined || day === undefined) {
    return [];
  }
  return [
    { day: Number(day), month, order: "DMY", year: fullYear(year, reference) },
  ];
}

export { fullYear, namedReadings, numericReadings };
export type { Reading };
