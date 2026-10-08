<script setup lang="ts">
import type { CalendarWeekdaysProps } from "./types";
import { computed } from "vue";
import { useCalendarContext } from "./calendar-context";
import { useMinutaContext } from "#src/minuta-context";

const { locale = "en-US" } = defineProps<CalendarWeekdaysProps>();

defineSlots<Record<string, never>>();

useCalendarContext();
const minuta = useMinutaContext();
const formatter = computed(
  () => new Intl.DateTimeFormat(locale, { weekday: "short" })
);
const weekdays = computed(() =>
  minuta
    .divide(minuta.period(minuta.browsing.value.start, "week"), "day")
    .map((day) => formatter.value.format(day.start))
);
</script>

<template>
  <div class="calendar-weekdays" data-testid="calendar-weekdays">
    <span v-for="weekday in weekdays" :key="weekday">{{ weekday }}</span>
  </div>
</template>

<style scoped>
.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-size: 0.85rem;
  text-transform: uppercase;
  color: #94a3b8;
  letter-spacing: 0.08em;
}
</style>
