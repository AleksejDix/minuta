<script setup lang="ts">
import type { CalendarDayProps } from "./types";
import { computed } from "vue";
import { isWeekendWith } from "minuta/calendar";
import { useCalendarContext } from "./calendar-context";
import { useMinutaContext } from "#src/minuta-context";

const { day, locale = "en-US" } = defineProps<CalendarDayProps>();

defineSlots<Record<string, never>>();

const calendar = useCalendarContext();
const minuta = useMinutaContext();

// The day number in the units' time zone, which may differ from the runtime's
const dayNumber = computed(() =>
  new Intl.DateTimeFormat(locale, {
    day: "numeric",
    timeZone: minuta.units.value.timeZone,
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
const isWeekend = computed(() => isWeekendWith(minuta.units.value, day));
const current = computed(() => {
  if (isToday.value) {
    return "date";
  }
  return "false";
});

/**
 * Selects the day and browses its month.
 */
function choose(): void {
  calendar.select(day);
  minuta.browse(day);
}
</script>

<template>
  <button
    type="button"
    class="calendar-day"
    :class="{
      'is-outside': isOutside,
      'is-selected': isSelected,
      'is-today': isToday,
      'is-weekend': isWeekend,
    }"
    :aria-current="current"
    :aria-pressed="isSelected"
    @click="choose"
  >
    {{ dayNumber }}
  </button>
</template>

<style scoped>
.calendar-day {
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

@media (max-width: 720px) {
  .calendar-day {
    min-height: 72px;
    padding: 0.4rem;
  }
}
</style>
