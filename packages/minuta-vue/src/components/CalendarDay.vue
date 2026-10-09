<script setup lang="ts">
import { activeDay, dayForKey } from "./day-navigation";
import { computed, nextTick, useTemplateRef } from "vue";
import type { CalendarDayProps } from "./types";
import type { Period } from "minuta/core";
import { isWeekendWith } from "minuta/calendar";
import { useCalendarContext } from "./calendar-context";
import { useMinutaContext } from "#src/minuta-context";

const { day, locale = "en-US" } = defineProps<CalendarDayProps>();

defineSlots<Record<string, never>>();

const TABBABLE = 0;
const NOT_TABBABLE = -1;
const SELECT_KEYS: ReadonlySet<string> = new Set(["Enter", " "]);

const calendar = useCalendarContext();
const minuta = useMinutaContext();
const button = useTemplateRef<HTMLButtonElement>("button");

// The labels in the units' time zone, which may differ from the runtime's
const dayNumber = computed(() =>
  new Intl.DateTimeFormat(locale, {
    day: "numeric",
    timeZone: minuta.units.value.timeZone,
  }).format(day.start)
);
const fullDate = computed(() =>
  new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    timeZone: minuta.units.value.timeZone,
    weekday: "long",
    year: "numeric",
  }).format(day.start)
);
const isOutside = computed(
  () => !minuta.contains(minuta.browsing.value, day.start)
);
const isToday = computed(() => minuta.contains(day, minuta.now.value.start));
const isSelected = computed(() => {
  const selected = calendar.selected.value;
  return selected !== undefined && minuta.same(selected, day, "day");
});
const isDisabled = computed(() => calendar.isDisabled(day));
const isWeekend = computed(() => isWeekendWith(minuta.units.value, day));
// Only one day of the grid is tabbable: focused, selected, today or the 1st
const tabIndex = computed(() => {
  const active = activeDay(minuta, minuta.browsing.value, [
    calendar.focused.value,
    calendar.selected.value,
    minuta.period(minuta.now.value.start, "day"),
  ]);
  if (minuta.same(active, day, "day")) {
    return TABBABLE;
  }
  return NOT_TABBABLE;
});
const current = computed(() => {
  if (isToday.value) {
    return "date";
  }
  return "false";
});

/**
 * Selects the day and browses its month, unless it is disabled.
 */
function choose(): void {
  calendar.focus(day);
  if (isDisabled.value) {
    return;
  }
  calendar.select(day);
  minuta.browse(day);
}

/**
 * The grid around an element.
 *
 * @param element - The element, null before mount
 * @returns The grid, null outside of one, undefined before mount
 */
function gridOf(element: HTMLElement | null): Element | null | undefined {
  if (element === null) {
    return undefined;
  }
  return element.closest('[role="grid"]');
}

/**
 * Focuses the tabbable day of a grid.
 *
 * @param grid - The grid, if any
 */
function focusTabbable(grid: Readonly<Element> | null | undefined): void {
  if (grid === null || grid === undefined) {
    return;
  }
  const tabbable = grid.querySelector<HTMLElement>('[tabindex="0"]');
  if (tabbable !== null) {
    tabbable.focus();
  }
}

/**
 * Moves the focus to a day, browsing to its month first.
 *
 * @param target - The day to focus
 */
async function moveFocus(target: Period): Promise<void> {
  // This day may be gone after browsing, its grid stays
  const grid = gridOf(button.value);
  calendar.focus(target);
  if (!minuta.contains(minuta.browsing.value, target.start)) {
    minuta.browse(target);
  }
  await nextTick();
  focusTabbable(grid);
}

/**
 * Enter and Space select the day, the navigation keys move the focus.
 *
 * @param event - The keydown event
 */
async function navigate(event: KeyboardEvent): Promise<void> {
  const target = dayForKey(minuta, day, event);
  if (SELECT_KEYS.has(event.key)) {
    event.preventDefault();
    choose();
  } else if (target !== undefined) {
    event.preventDefault();
    if (!minuta.same(target, day, "day")) {
      await moveFocus(target);
    }
  }
}
</script>

<template>
  <button
    ref="button"
    type="button"
    class="calendar-day"
    :class="{
      'is-disabled': isDisabled,
      'is-outside': isOutside,
      'is-selected': isSelected,
      'is-today': isToday,
      'is-weekend': isWeekend,
    }"
    :tabindex="tabIndex"
    :aria-label="fullDate"
    :aria-current="current"
    :aria-disabled="isDisabled"
    @click="choose"
    @keydown="navigate"
  >
    {{ dayNumber }}
  </button>
</template>

<style scoped>
.calendar-day {
  width: 100%;
  border: none;
  border-radius: 0;
  background: #f8fafc;
  min-height: 84px;
  display: flex;
  align-items: flex-start;
  padding: 0.5rem 0.75rem;
  font-size: 1.35rem;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    background 0.15s ease;
  color: #0f172a;
}

.calendar-day:hover {
  transform: translateY(-2px);
  background: #eef2ff;
}

.calendar-day.is-weekend {
  background: #fef2f2;
  color: #991b1b;
}

.calendar-day.is-outside {
  color: #94a3b8;
  background: #f1f5f9;
}

.calendar-day.is-today {
  outline: 2px solid #6366f1;
  outline-offset: -2px;
}

.calendar-day.is-selected {
  background: #6366f1;
  color: white;
}

.calendar-day.is-disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.calendar-day:focus-visible {
  outline: 3px solid #0f172a;
  outline-offset: 2px;
}

@media (max-width: 720px) {
  .calendar-day {
    min-height: 72px;
    padding: 0.4rem;
  }
}
</style>
