import { describe, expect, it } from "vitest";
import { allLocales } from "#src/locales/all";
import { parseDate } from "#src/index";

/*
 * The verification against the source, like ibanita's registry test: every
 * date and date-time Intl.DateTimeFormat writes in every locale (Gregorian
 * calendar) reads back as the same moment.
 */

const REFERENCE = new Date("2026-01-01T00:00");
const HOUR_DIGITS = 2;
const TAGS = Object.keys(allLocales);

// The 28th of every month, a leap day, the turn of years, far years
const DATES: readonly Readonly<Date>[] = [
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
].map((day) => new Date(`${day}T00:00`));

// Every hour of one day, for AM/PM and flexible day periods
const TIMES: readonly Readonly<Date>[] = Array.from(
  { length: 24 },
  (_unused, hour) =>
    new Date(`2026-03-31T${String(hour).padStart(HOUR_DIGITS, "0")}:07`)
);

type Sample = Readonly<{
  date: Readonly<Date>;
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
  const text = new Intl.DateTimeFormat(locale, sample.options).format(
    sample.date
  );
  const result = parseDate(text, { locale: tag, referenceDate: REFERENCE });
  return result.valid && result.date.getTime() === sample.date.getTime();
}

function failuresIn(tag: string): string[] {
  return SAMPLES.filter((sample) => !readsBack(tag, sample)).map((sample) =>
    new Intl.DateTimeFormat(`${tag}-u-ca-gregory`, sample.options).format(
      sample.date
    )
  );
}

describe("every Intl.DateTimeFormat output parses back", () => {
  it.each(TAGS)("%s", { timeout: 30_000 }, (tag) => {
    expect.hasAssertions();
    expect(failuresIn(tag)).toStrictEqual([]);
  });
});
