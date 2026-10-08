import type { ComputedRef, Ref } from "vue";
import type { Minuta, Period, Unit, Units } from "minuta/core";

/**
 * Options of `useMinuta()` and the props of `<MinutaRoot>`.
 */
type MinutaOptions = Readonly<{
  /** Initially browsed date, default: now */
  date?: Readonly<Date> | undefined;
  /** "Today", default: the date `useMinuta()` was called */
  now?: Readonly<Date> | undefined;
  /** Unit of the browsed period, default "month" */
  unit?: Unit | undefined;
  /** Unit specs, default `nativeUnits()`; the week start lives in the units */
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
 * `withUnits(units)` plus the reactive browsing state.
 */
type MinutaState = Minuta &
  Readonly<{
    /** Browse the period containing `period.start` */
    browse: (period: Period) => void;
    /** The browsed period, in the current unit and units */
    browsing: ComputedRef<Period>;
    /** "Today" as a second period */
    now: ComputedRef<Period>;
    /** The current unit specs */
    units: ComputedRef<Units>;
  }>;

export type { MinutaOptions, MinutaRootProps, MinutaState, Source };
export type { Minuta, Period, Unit, Units } from "minuta/core";
