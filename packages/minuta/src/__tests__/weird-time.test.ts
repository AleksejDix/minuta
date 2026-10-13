import type { Period, Units } from "#src/types";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { nextWith, previousWith } from "#src/operations/shift";
import { dateFnsTzUnits } from "#src/adapters/date-fns-tz/index";
import { divideWith } from "#src/operations/divide";
import { getUnitsTestCases } from "#src/test/shared-adapter-tests";
import { periodWith } from "#src/operations/period";

/*
 * Days on which time does not run on a 24-hour grid. Every operation must
 * keep its promises on them: periods touch without gaps or overlaps, next
 * moves forward and previous back, and a day split into hours covers it.
 */
type WeirdDay = Readonly<{
  /** A moment inside the day, in UTC */
  at: string;
  /** How long the day really is */
  hours: number;
  what: string;
  zone: string;
}>;

const WEIRD_DAYS: readonly WeirdDay[] = [
  {
    at: "2026-03-29T12:00:00Z",
    hours: 23,
    what: "spring forward",
    zone: "Europe/Zurich",
  },
  {
    at: "2026-10-25T12:00:00Z",
    hours: 25,
    what: "fall back",
    zone: "Europe/Zurich",
  },
  {
    at: "2026-03-08T17:00:00Z",
    hours: 23,
    what: "spring forward",
    zone: "America/New_York",
  },
  {
    at: "2026-10-04T01:00:00Z",
    hours: 23.5,
    what: "30-minute spring forward",
    zone: "Australia/Lord_Howe",
  },
  {
    at: "2026-04-05T01:00:00Z",
    hours: 24.5,
    what: "30-minute fall back",
    zone: "Australia/Lord_Howe",
  },
  {
    at: "2026-09-06T12:00:00Z",
    hours: 23,
    what: "no midnight",
    zone: "America/Santiago",
  },
  {
    at: "2026-04-04T15:00:00Z",
    hours: 25,
    what: "midnight hour twice",
    zone: "America/Santiago",
  },
  {
    at: "2011-12-29T12:00:00Z",
    hours: 24,
    what: "the day before a skipped day",
    zone: "Pacific/Apia",
  },
  {
    at: "2011-12-30T12:00:00Z",
    hours: 24,
    what: "the day after a skipped day",
    zone: "Pacific/Apia",
  },
  {
    at: "2026-03-01T06:00:00Z",
    hours: 24,
    what: "UTC+5:45",
    zone: "Asia/Kathmandu",
  },
  {
    at: "2026-03-01T00:00:00Z",
    hours: 24,
    what: "UTC+14",
    zone: "Pacific/Kiritimati",
  },
  {
    at: "2026-03-01T00:00:00Z",
    hours: 24,
    what: "UTC−11",
    zone: "Pacific/Pago_Pago",
  },
];

const MS_AN_HOUR = 3_600_000;
const ONE_MS = 1;
const ONE = 1;
const FIRST = 0;
const LAST = -1;
const DAYS_AROUND = 3;
const HOURS_TO_WALK = 30;

function hoursOf(day: Period): number {
  return (day.end.getTime() + ONE_MS - day.start.getTime()) / MS_AN_HOUR;
}

// Each place where consecutive `pieces` leave a gap or overlap
function seams(pieces: readonly Period[]): string[] {
  return pieces.slice(ONE).flatMap((piece, index) => {
    const previous = pieces[index];
    if (
      previous === undefined ||
      piece.start.getTime() === previous.end.getTime() + ONE_MS
    ) {
      return [];
    }
    return [`${previous.end.toISOString()} → ${piece.start.toISOString()}`];
  });
}

// The seams of `pieces`, and whether they run from the start to the end of `span`
function coverage(pieces: readonly Period[], span: Period): string[] {
  const first = pieces.at(FIRST);
  const last = pieces.at(LAST);
  if (first === undefined || last === undefined) {
    return ["no pieces"];
  }
  const edges = [
    first.start.getTime() - span.start.getTime(),
    last.end.getTime() - span.end.getTime(),
  ];
  return [
    ...seams(pieces),
    ...edges
      .filter((off) => off !== FIRST)
      .map((off) => `edge off by ${off} ms`),
  ];
}

// `period` and the `count` periods after it
function walkForward(units: Units, period: Period, count: number): Period[] {
  const periods = [period];
  for (let step = FIRST; step < count; step += ONE) {
    periods.push(nextWith(units, periods.at(LAST) ?? period));
  }
  return periods;
}

// The `count` periods before `period`, and `period`
function walkBack(units: Units, period: Period, count: number): Period[] {
  const periods = [period];
  for (let step = FIRST; step < count; step += ONE) {
    periods.unshift(previousWith(units, periods.at(FIRST) ?? period));
  }
  return periods;
}

function dayOf(units: Units, weird: WeirdDay): Period {
  return periodWith(units, new Date(weird.at), "day");
}

type Case = Readonly<{
  computerZone: string;
  label: string;
  units: Units;
  weird: WeirdDay;
}>;

/*
 * Every weird day with date-fns-tz from a computer in UTC, and with every
 * other engine from a computer in the day's own zone
 */
function casesFor(weird: WeirdDay): Case[] {
  const cases: Case[] = [
    {
      computerZone: "UTC",
      label: `${weird.zone} ${weird.what}, date-fns-tz`,
      units: dateFnsTzUnits({ timeZone: weird.zone }),
      weird,
    },
  ];
  for (const [name, units] of getUnitsTestCases()) {
    cases.push({
      computerZone: weird.zone,
      label: `${weird.zone} ${weird.what}, ${name}`,
      units,
      weird,
    });
  }
  return cases;
}

const CASES: readonly Case[] = WEIRD_DAYS.flatMap((weird) => casesFor(weird));

describe.each(CASES)("weird time: $label", ({ computerZone, units, weird }) => {
  beforeAll(() => {
    vi.stubEnv("TZ", computerZone);
  });

  afterAll(() => {
    vi.unstubAllEnvs();
  });

  it("the day has its real length", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(hoursOf(dayOf(units, weird))).toBe(weird.hours);
  });

  it("its hours cover it exactly", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const day = dayOf(units, weird);
    expect(coverage(divideWith(units, day, "hour"), day)).toStrictEqual([]);
  });

  it("days before and after touch", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const day = dayOf(units, weird);
    const days = [
      ...walkBack(units, day, DAYS_AROUND),
      ...walkForward(units, day, DAYS_AROUND).slice(ONE),
    ];
    expect(seams(days)).toStrictEqual([]);
  });

  it(
    "stepping hour by hour through the day leaves no gap",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const first = periodWith(units, dayOf(units, weird).start, "hour");
      expect(seams(walkForward(units, first, HOURS_TO_WALK))).toStrictEqual([]);
    }
  );

  it("next undoes previous", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const day = dayOf(units, weird);
    expect(nextWith(units, previousWith(units, day))).toStrictEqual(day);
    expect(previousWith(units, nextWith(units, day))).toStrictEqual(day);
  });
});
