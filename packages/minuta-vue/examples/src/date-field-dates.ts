import { localDay, shown } from './date-field-test-utils'
import { Temporal } from 'temporal-polyfill'

const YEAR = 2026
const MONTHS = 12
const MID_MONTH = 15
const FIRST_DAY = 1
const ONE = 1
const TWO_DIGITS = 2

const EDGE_DATES: readonly Readonly<Temporal.PlainDate>[] = [
  '2026-01-01',
  '2026-12-31',
  '2026-02-28',
  '2028-02-29',
  '2000-02-29',
  '1999-12-31',
  '1990-01-01',
  '2049-06-15',
].map((iso) => localDay(iso))

const MONTH_NUMBERS = Array.from({ length: MONTHS }, (_unused, index) => index + ONE)

// The first, middle and last day of every month in a year
const MONTH_DATES: readonly Readonly<Temporal.PlainDate>[] = MONTH_NUMBERS.flatMap((month) => {
  const first = Temporal.PlainDate.from({
    day: FIRST_DAY,
    month,
    year: YEAR,
  })
  return [first, first.with({ day: MID_MONTH }), first.with({ day: first.daysInMonth })]
})

const DATES: readonly Readonly<Temporal.PlainDate>[] = [...EDGE_DATES, ...MONTH_DATES]

function isoDate(date: Readonly<Temporal.PlainDate>): string {
  return date.toString()
}

/**
 * A day as `Date#toDateString()` writes it, "Wed Oct 28 2026": people copy
 * that too.
 *
 * @param date - The day
 * @returns The text
 */
function dateString(date: Readonly<Temporal.PlainDate>): string {
  const weekday = date.toLocaleString('en-US', { weekday: 'short' })
  const month = date.toLocaleString('en-US', { month: 'short' })
  const day = String(date.day).padStart(TWO_DIGITS, '0')
  return `${weekday} ${month} ${day} ${String(date.year)}`
}

const STYLES = ['medium', 'long', 'full'] as const

/**
 * The ways people copy a date: the field's own text, ISO,
 * `toDateString()` and the locale's written styles.
 *
 * @param locale - Locale of the field
 * @param date - The date to write
 * @returns Pasteable texts that all mean `date`
 */
function writtenForms(locale: string, date: Readonly<Temporal.PlainDate>): string[] {
  return [
    shown(locale, date),
    isoDate(date),
    dateString(date),
    ...STYLES.map((dateStyle) => date.toLocaleString(locale, { dateStyle })),
  ]
}

function sameDay(
  left: Readonly<Temporal.PlainDate> | undefined,
  right: Readonly<Temporal.PlainDate>,
): boolean {
  return left !== undefined && isoDate(left) === isoDate(right)
}

export { DATES, EDGE_DATES, dateString, isoDate, sameDay, writtenForms }
