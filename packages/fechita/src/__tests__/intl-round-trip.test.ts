import { describe, expect, it } from "vitest";
import { Temporal } from "temporal-polyfill/full";
import { allLocales } from "#src/locales/all";
import { parseDate } from "#src/index";

/*
 * The verification against the source, like ibanita's registry test: every
 * date and date-time Intl.DateTimeFormat writes in every locale (Gregorian
 * calendar) reads back as the same moment.
 */

const REFERENCE = Temporal.PlainDate.from("2026-01-01");
const HOUR_DIGITS = 2;
const TAGS = Object.keys(allLocales);

// The 28th of every month, a leap day, the turn of years, far years
const DATES: readonly Readonly<Temporal.PlainDate>[] = [
  "2026-01-28",
  "2026-02-28",
  "2026-03-28",
  "2026-04-28",
  "2026-05-28",
  "2026-06-28",
  "2026-07-28",
  "2026-08-28",
  "2026-09-28",
  "2026-10-28",
  "2026-11-28",
  "2026-12-28",
  "2024-02-29",
  "1999-12-31",
  "2000-01-01",
  "2031-07-04",
  "1970-01-01",
].map((day) => Temporal.PlainDate.from(day));

// Every hour of one day, for AM/PM and flexible day periods
const TIMES: readonly Readonly<Temporal.PlainDateTime>[] = Array.from(
  { length: 24 },
  (_unused, hour) =>
    Temporal.PlainDateTime.from(
      `2026-03-31T${String(hour).padStart(HOUR_DIGITS, "0")}:07`
    )
);

type Sample = Readonly<{
  date: Readonly<Temporal.PlainDate> | Readonly<Temporal.PlainDateTime>;
  options: Readonly<Intl.DateTimeFormatOptions>;
}>;

const SAMPLES: readonly Sample[] = [
  ...(["full", "long", "medium", "short"] as const).flatMap((dateStyle) =>
    DATES.map((date) => ({ date, options: { dateStyle } }))
  ),
  ...(["medium", "short"] as const).flatMap((timeStyle) =>
    TIMES.map((date) => ({
      date,
      options: { dateStyle: "short" as const, timeStyle },
    }))
  ),
];

function readsBack(tag: string, sample: Sample): boolean {
  const locale = `${tag}-u-ca-gregory`;
  const text = sample.date.toLocaleString(locale, sample.options);
  const result = parseDate(text, { locale: tag, referenceDate: REFERENCE });
  return result.valid && result.value.toString() === sample.date.toString();
}

function failuresIn(tag: string): string[] {
  return SAMPLES.filter((sample) => !readsBack(tag, sample)).map((sample) =>
    sample.date.toLocaleString(`${tag}-u-ca-gregory`, sample.options)
  );
}

describe("every Intl.DateTimeFormat output parses back", () => {
  it.each(TAGS)("%s", { timeout: 30_000 }, (tag) => {
    expect.hasAssertions();
    expect(failuresIn(tag)).toStrictEqual([]);
  });
});
