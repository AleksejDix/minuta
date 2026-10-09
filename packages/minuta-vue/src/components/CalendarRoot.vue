<script setup lang="ts">
import { provide, shallowRef, useId } from "vue";
import type { CalendarRootProps } from "./types";
import MinutaRoot from "./MinutaRoot.vue";
import type { Period } from "minuta/core";
import { calendarContextKey } from "./calendar-context";

const {
  date,
  isDisabled: isDisabledProp,
  units,
} = defineProps<CalendarRootProps>();

const emit = defineEmits<{
  select: [day: Period];
}>();

defineSlots<{
  default?: () => unknown;
}>();

const selected = shallowRef<Period>();
const focused = shallowRef<Period>();
const labelId = useId();

/**
 * Remembers the focused day.
 *
 * @param day - The focused day
 */
function focus(day: Period): void {
  focused.value = day;
}

/**
 * Whether a day can't be selected.
 *
 * @param day - The day to check
 * @returns True when the `isDisabled` prop says so
 */
function isDisabled(day: Period): boolean {
  return isDisabledProp !== undefined && isDisabledProp(day);
}

/**
 * Selects a day and reports it.
 *
 * @param day - The chosen day
 */
function select(day: Period): void {
  selected.value = day;
  emit("select", day);
}

provide(calendarContextKey, {
  focus,
  focused,
  isDisabled,
  labelId,
  select,
  selected,
});
</script>

<template>
  <MinutaRoot :date="date" :units="units" unit="month">
    <slot />
  </MinutaRoot>
</template>
