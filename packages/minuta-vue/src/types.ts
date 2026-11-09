import type { ComputedRef, Ref } from "vue";
import type {
  Minuta,
  Period,
  TimePeriod,
  TimeValue,
  Unit,
  Units,
  ZonedDateTime,
} from "@aleksejdix/minuta";

/**
 * Options of `useMinuta()` and the props of `<MinutaRoot>`.
 */
type MinutaOptions = Readonly<{
  /** Initially browsed date or moment, default: now */
  date?: TimeValue | undefined;
  /** The moment that counts as now, default: the clock, re-read at every new day */
  now?: ZonedDateTime | undefined;
  /** Unit of the browsed period, default "month" */
  unit?: Unit | undefined;
  /** Unit specs, default `createUnits()`; the week start lives in the units */
  units?: Units | undefined;
}>;

/**
 * A value, a ref holding it, or a getter returning it.
 */
type Source<Value> = Value | Ref<Value> | ComputedRef<Value> | (() => Value);

/**
 * Props of `<MinutaRoot>`: the options of `useMinuta()`.
 */
type MinutaRootProps = MinutaOptions;

/**
 * What `useMinuta()` returns and `<MinutaRoot>` provides: every operation of
 * `withUnits(units)` plus the reactive browsing state; `units` is a ref like
 * the rest of the state.
 */
type MinutaState = Omit<Minuta, "units"> &
  Readonly<{
    /** Browse the period containing `period.start` */
    browse: (period: Period) => void;
    /** The browsed period, in the current unit and units */
    browsing: ComputedRef<Period>;
    /** Now, as the second it falls in */
    now: ComputedRef<TimePeriod>;
    /** The current unit specs */
    units: ComputedRef<Units>;
  }>;

export type { MinutaOptions, MinutaRootProps, MinutaState, Source };
export type { Minuta, Period, Unit, Units } from "@aleksejdix/minuta";
