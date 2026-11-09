import type { Minuta, ZonedDateTime } from "@aleksejdix/minuta";
import { useEffect, useState } from "react";
import { currentMoment } from "./now";

// The zone the operations' units read moments in
function timeZoneOf(operations: Minuta): string {
  return (
    operations.units.timeZone ??
    new Intl.DateTimeFormat().resolvedOptions().timeZone
  );
}

function keepClock(): void {
  // A controlled `now` sets no timer, so there is nothing to clear
}

/**
 * The current moment in the units' zone, re-read at the start of every day
 * there, so "today" never goes stale. Inactive while `isControlled`.
 *
 * @param operations - The bound operations whose days to follow
 * @param isControlled - Whether the caller passes `now` itself
 * @returns The moment the clock was last read
 */
function useClock(operations: Minuta, isControlled: boolean): ZonedDateTime {
  const [clock, setClock] = useState<ZonedDateTime>(() =>
    currentMoment(timeZoneOf(operations))
  );
  useEffect(() => {
    if (isControlled) {
      return keepClock;
    }
    const tomorrow = operations.next(operations.period(clock, "day")).start;
    const nextDay = tomorrow.toZonedDateTime({ timeZone: clock.timeZoneId });
    const timer = setTimeout(
      () => {
        setClock(currentMoment(timeZoneOf(operations)));
      },
      nextDay.epochMilliseconds -
        currentMoment(clock.timeZoneId).epochMilliseconds
    );
    return (): void => {
      clearTimeout(timer);
    };
  }, [clock, isControlled, operations]);
  return clock;
}

export { useClock };
