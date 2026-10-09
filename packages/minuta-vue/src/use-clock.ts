import type { ComputedRef, Ref } from "vue";
import { shallowRef, watchEffect } from "vue";
import type { Minuta } from "minuta/core";

/**
 * The current date, re-read at the start of every day of the operations'
 * units, so "today" never goes stale. Sets no timer while `isControlled`;
 * the timer stops with the surrounding effect scope.
 *
 * @param operations - The bound operations whose days to follow
 * @param isControlled - Whether the caller passes `now` itself
 * @returns The date the clock was last read
 */
function useClock(
  operations: ComputedRef<Minuta>,
  isControlled: () => boolean
): Readonly<Ref<Readonly<Date>>> {
  const clock = shallowRef<Readonly<Date>>(new Date());
  watchEffect((onCleanup) => {
    if (isControlled()) {
      return;
    }
    const today = operations.value.period(clock.value, "day");
    const nextDay = operations.value.next(today).start;
    const timer = setTimeout(() => {
      clock.value = new Date();
    }, nextDay.getTime() - Date.now());
    onCleanup(() => {
      clearTimeout(timer);
    });
  });
  return clock;
}

export { useClock };
