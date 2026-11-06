import type { ComputedRef, Ref } from "vue";
import type { Minuta, ZonedDateTime } from "@aleksejdix/minuta/core";
import { shallowRef, watchEffect } from "vue";
import { currentMoment } from "#src/now";

// The zone the operations' units read moments in
function timeZoneOf(operations: Minuta): string {
  return (
    operations.units.timeZone ??
    new Intl.DateTimeFormat().resolvedOptions().timeZone
  );
}

/**
 * The current moment in the units' zone, re-read at the start of every day
 * there, so "today" never goes stale. Sets no timer while `isControlled`;
 * the timer stops with the surrounding effect scope.
 *
 * @param operations - The bound operations whose days to follow
 * @param isControlled - Whether the caller passes `now` itself
 * @returns The moment the clock was last read
 */
function useClock(
  operations: ComputedRef<Minuta>,
  isControlled: () => boolean
): Readonly<Ref<ZonedDateTime>> {
  const clock = shallowRef<ZonedDateTime>(
    currentMoment(timeZoneOf(operations.value))
  );
  watchEffect((onCleanup) => {
    if (isControlled()) {
      return;
    }
    const today = operations.value.period(clock.value, "day");
    const tomorrow = operations.value.next(today).start;
    const nextDay = tomorrow.toZonedDateTime({
      timeZone: clock.value.timeZoneId,
    });
    const timer = setTimeout(
      () => {
        clock.value = currentMoment(timeZoneOf(operations.value));
      },
      nextDay.epochMilliseconds -
        currentMoment(clock.value.timeZoneId).epochMilliseconds
    );
    onCleanup(() => {
      clearTimeout(timer);
    });
  });
  return clock;
}

export { useClock };
