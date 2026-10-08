<script setup lang="ts">
import CalendarDay from "./CalendarDay.vue";
import type { Period } from "minuta/core";
import { computed } from "vue";
import { monthGridWith } from "minuta/calendar";
import { useCalendarContext } from "./calendar-context";
import { useMinutaContext } from "#src/minuta-context";

defineSlots<{
  day?: (scope: { day: Period }) => unknown;
}>();

useCalendarContext();
const minuta = useMinutaContext();
const days = computed(
  () => monthGridWith(minuta.units.value, minuta.browsing.value.start).periods
);
</script>

<template>
  <div class="calendar-grid" data-testid="calendar-grid">
    <template v-for="day in days" :key="day.start.toISOString()">
      <slot name="day" :day="day">
        <CalendarDay :day="day" />
      </slot>
    </template>
  </div>
</template>

<style scoped>
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.4rem;
}
</style>
