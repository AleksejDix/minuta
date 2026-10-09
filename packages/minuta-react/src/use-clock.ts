import { useEffect, useState } from "react";
import type { Minuta } from "minuta/core";

function currentDate(): Date {
  return new Date();
}

function keepClock(): void {
  // A controlled `now` sets no timer, so there is nothing to clear
}

/**
 * The current date, re-read at the start of every day of `operations`'
 * units, so "today" never goes stale. Inactive while `isControlled`.
 *
 * @param operations - The bound operations whose days to follow
 * @param isControlled - Whether the caller passes `now` itself
 * @returns The date the clock was last read
 */
function useClock(operations: Minuta, isControlled: boolean): Readonly<Date> {
  const [clock, setClock] = useState<Readonly<Date>>(currentDate);
  useEffect(() => {
    if (isControlled) {
      return keepClock;
    }
    const nextDay = operations.next(operations.period(clock, "day")).start;
    const timer = setTimeout(() => {
      setClock(currentDate());
    }, nextDay.getTime() - Date.now());
    return (): void => {
      clearTimeout(timer);
    };
  }, [clock, isControlled, operations]);
  return clock;
}

export { useClock };
