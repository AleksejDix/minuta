<script setup lang="ts">
import type { CalendarWeekdaysProps } from "./types";
import { computed } from "vue";
import { formatPeriod } from "@aleksejdix/minuta/format";
import { useCalendarContext } from "./calendar-context";
import { useMinutaContext } from "#src/minuta-context";

const { locale = "en-US" } = defineProps<CalendarWeekdaysProps>();

defineSlots<Record<string, never>>();

useCalendarContext();
const minuta = useMinutaContext();
// The column headers of the grid: short labels abbreviating the full weekday
const weekdays = computed(() =>
  minuta
    .divide(minuta.period(minuta.browsing.value.start, "week"), "day")
    .map((day) => ({
      full: formatPeriod(day, locale, { weekday: "long" }),
      short: formatPeriod(day, locale, { weekday: "short" }),
    }))
);
</script>

<template>
  <thead class="calendar-weekdays" data-testid="calendar-weekdays">
    <tr>
      <th
        v-for="weekday in weekdays"
        :key="weekday.full"
        scope="col"
        :abbr="weekday.full"
      >
        {{ weekday.short }}
      </th>
    </tr>
  </thead>
</template>

<style scoped>
.calendar-weekdays th {
  font-size: 0.85rem;
  font-weight: inherit;
  text-transform: uppercase;
  color: #94a3b8;
  letter-spacing: 0.08em;
}
</style>
