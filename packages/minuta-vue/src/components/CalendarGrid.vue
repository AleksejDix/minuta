<script setup lang="ts">
import CalendarDay from "./CalendarDay.vue";
import type { CalendarGridProps } from "./types";
import CalendarWeekdays from "./CalendarWeekdays.vue";
import type { Period } from "minuta/core";
import { computed } from "vue";
import { monthGridWith } from "minuta/calendar";
import { useCalendarContext } from "./calendar-context";
import { useMinutaContext } from "#src/minuta-context";

const { locale = "en-US" } = defineProps<CalendarGridProps>();

defineSlots<{
  day?: (scope: { day: Period }) => unknown;
}>();

const DAYS_PER_WEEK = 7;

const calendar = useCalendarContext();
const minuta = useMinutaContext();
const weeks = computed(() => {
  const days = monthGridWith(
    minuta.units.value,
    minuta.browsing.value.start
  ).periods;
  const rows: Period[][] = [];
  for (let index = 0; index < days.length; index += DAYS_PER_WEEK) {
    rows.push(days.slice(index, index + DAYS_PER_WEEK));
  }
  return rows;
});

/**
 * Whether a day is the selected one.
 *
 * @param day - The day of the cell
 * @returns True for the selected day
 */
function isSelected(day: Period): boolean {
  const selected = calendar.selected.value;
  return selected !== undefined && minuta.same(selected, day, "day");
}
</script>

<template>
  <!-- The APG date picker grid: a table with role="grid" -->
  <table
    class="calendar-grid"
    role="grid"
    :aria-labelledby="calendar.labelId"
    data-testid="calendar-grid"
  >
    <CalendarWeekdays :locale="locale" />
    <tbody>
      <tr v-for="(week, row) in weeks" :key="row">
        <td
          v-for="day in week"
          :key="day.start.toISOString()"
          class="calendar-cell"
          :aria-selected="isSelected(day)"
        >
          <slot name="day" :day="day">
            <CalendarDay :day="day" :locale="locale" />
          </slot>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
.calendar-grid {
  width: 100%;
  table-layout: fixed;
  border-collapse: separate;
  border-spacing: 0.4rem;
}

.calendar-cell {
  padding: 0;
}
</style>
