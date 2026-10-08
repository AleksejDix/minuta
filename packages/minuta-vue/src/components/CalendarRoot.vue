<script setup lang="ts">
import { provide, shallowRef } from "vue";
import type { CalendarRootProps } from "./types";
import MinutaRoot from "./MinutaRoot.vue";
import type { Period } from "minuta/core";
import { calendarContextKey } from "./calendar-context";

const { date, units } = defineProps<CalendarRootProps>();

const emit = defineEmits<{
  select: [day: Period];
}>();

defineSlots<{
  default?: () => unknown;
}>();

const selected = shallowRef<Period>();

/**
 * Selects a day and reports it.
 *
 * @param day - The chosen day
 */
function select(day: Period): void {
  selected.value = day;
  emit("select", day);
}

provide(calendarContextKey, { select, selected });
</script>

<template>
  <MinutaRoot :date="date" :units="units" unit="month">
    <slot />
  </MinutaRoot>
</template>
