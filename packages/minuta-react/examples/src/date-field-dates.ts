import { localDay, shown } from "./date-field-test-utils";

const YEAR = 2026;
const MONTHS = 12;
const MID_MONTH = 15;
const FIRST_DAY = 1;
// Day 0 of a month is the last day of the month before
const LAST_OF_PREVIOUS = 0;
const ISO_WIDTH = 2;
const ISO_PAD = "0";
const ONE = 1;

const EDGE_DATES: readonly Date[] = [
  "2026-01-01",
  "2026-12-31",
  "2026-02-28",
  "2028-02-29",
  "2000-02-29",
  "1999-12-31",
  "1990-01-01",
  "2049-06-15",
].map((iso) => localDay(iso));

const MONTH_INDEXES = Array.from({ length: MONTHS }, (_unused, month) => month);

// The first, middle and last day of every month in a year
const MONTH_DATES: readonly Date[] = MONTH_INDEXES.flatMap((month) => [
  new Date(YEAR, month, FIRST_DAY),
  new Date(YEAR, month, MID_MONTH),
  new Date(YEAR, month + ONE, LAST_OF_PREVIOUS),
]);

const DATES: readonly Date[] = [...EDGE_DATES, ...MONTH_DATES];

function isoDate(date: Readonly<Date>): string {
  const month = String(date.getMonth() + ONE).padStart(ISO_WIDTH, ISO_PAD);
  const day = String(date.getDate()).padStart(ISO_WIDTH, ISO_PAD);
  return `${String(date.getFullYear())}-${month}-${day}`;
}

const STYLES = ["medium", "long", "full"] as const;

/**
 * The ways people copy a date: the field's own text, ISO,
 * `toDateString()` and the locale's written styles.
 *
 * @param locale - Locale of the field
 * @param date - The date to write
 * @returns Pasteable texts that all mean `date`
 */
function writtenForms(locale: string, date: Readonly<Date>): string[] {
  return [
    shown(locale, date),
    isoDate(date),
    date.toDateString(),
    ...STYLES.map((dateStyle) =>
      new Intl.DateTimeFormat(locale, { dateStyle }).format(date)
    ),
  ];
}

function sameDay(
  left: Readonly<Date> | undefined,
  right: Readonly<Date>
): boolean {
  return left !== undefined && isoDate(left) === isoDate(right);
}

export { DATES, EDGE_DATES, isoDate, sameDay, writtenForms };
