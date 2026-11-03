import type {
  Period,
  TimePeriod,
  TimeUnit,
  Units,
  ZonedDateTime,
} from "#src/types";
import { getTemporal } from "#src/adapters/temporal/temporal-api";
import { isDatePeriod } from "#src/values";
import { periodWith } from "./period";
import { specFor } from "#src/units";

const NO_STEPS = 0;
const ONE = 1;

// The moment `nanoseconds` after `date`, in its zone
function later(date: ZonedDateTime, nanoseconds: bigint): ZonedDateTime {
  return getTemporal()
    .Instant.fromEpochNanoseconds(date.epochNanoseconds + nanoseconds)
    .toZonedDateTimeISO(date.timeZoneId);
}

/**
 * A custom period moved by `steps` times its own length: days for a date
 * period, exact time for a time period.
 *
 * @param period - A custom period
 * @param steps - How many lengths to move
 * @returns The moved period
 */
function moveByLength(period: Period, steps: number): Period {
  if (isDatePeriod(period)) {
    const days =
      period.start.until(period.end, { largestUnit: "day" }).days * steps;
    return {
      end: period.end.add({ days }),
      start: period.start.add({ days }),
      unit: "custom",
    };
  }
  const shift =
    (period.end.epochNanoseconds - period.start.epochNanoseconds) *
    BigInt(steps);
  return {
    end: later(period.end, shift),
    start: later(period.start, shift),
    unit: "custom",
  };
}

/*
 * Units of a fixed length in every zone: a step is plain arithmetic. Not
 * hours: Lord Howe moves its clocks by 30 minutes, so its hours vary.
 */
const FIXED_LENGTH: ReadonlySet<string> = new Set(["minute", "second"]);

/**
 * Step a time period one neighbour at a time: to the period starting at its
 * end, or the one ending at its start, so a step never skips the half hour
 * a 30-minute clock change leaves.
 *
 * @param units - Available unit specs
 * @param walk - The period, its time unit and how many steps
 * @returns The period that many places away
 */
function stepped(
  units: Units,
  walk: Readonly<{ period: TimePeriod; steps: number; unit: TimeUnit }>
): TimePeriod {
  const { steps, unit } = walk;
  if (FIXED_LENGTH.has(unit)) {
    return periodWith(
      units,
      specFor(units, unit).add(walk.period.start, steps),
      unit
    );
  }
  let moved = walk.period;
  for (let step = NO_STEPS; step < Math.abs(steps); step += ONE) {
    if (steps > NO_STEPS) {
      moved = periodWith(units, moved.end, unit);
    } else {
      moved = periodWith(
        units,
        moved.start.subtract({ nanoseconds: ONE }),
        unit
      );
    }
  }
  return moved;
}

function shifted(units: Units, period: Period, steps: number): Period {
  if (steps === NO_STEPS) {
    return period;
  }
  if (period.unit === "custom") {
    return moveByLength(period, steps);
  }
  if (isDatePeriod(period)) {
    const spec = specFor(units, period.unit);
    return periodWith(units, spec.add(period.start, steps), period.unit);
  }
  return stepped(units, { period, steps, unit: period.unit });
}

/**
 * Move a period by `steps` of its own unit: the period that many places
 * after (or before) it, so shifting by n is n times `next`. A custom period
 * moves by its own length.
 *
 * @example
 * shiftWith(units, march, 2)  // May
 * shiftWith(units, march, -1) // February
 *
 * @param units - Available unit specs
 * @param period - Period to move
 * @param steps - How many periods to move; negative moves back
 * @returns The moved period, or the same period for 0 steps
 */
function shiftWith<Source extends Period>(
  units: Units,
  period: Source,
  steps: number
): Source {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Shifting keeps the kind: dates stay dates, moments stay moments
  return shifted(units, period, steps) as Source;
}

/**
 * The next period of the same unit.
 *
 * @example
 * nextWith(units, march); // April
 *
 * @param units - Available unit specs
 * @param period - Current period
 * @returns The following period
 */
function nextWith<Source extends Period>(units: Units, period: Source): Source {
  return shiftWith(units, period, ONE);
}

/**
 * The previous period of the same unit.
 *
 * @example
 * previousWith(units, march); // February
 *
 * @param units - Available unit specs
 * @param period - Current period
 * @returns The preceding period
 */
function previousWith<Source extends Period>(
  units: Units,
  period: Source
): Source {
  return shiftWith(units, period, -ONE);
}

export { nextWith, previousWith, shiftWith };
