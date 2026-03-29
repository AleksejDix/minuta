<script setup lang="ts">
import type { Unit } from "minuta";
import type { Ref } from "vue";
import { computed, unref } from "vue";

const props = defineProps<{
  unit?: Unit | Ref<Unit>;
}>();

const unitValue = computed<Unit>(() => {
  const value = props.unit;
  return value ? unref(value) : "month";
});

const unitComponent = computed(() => {
  switch (unitValue.value) {
    case "year":
      return "YearName";
    case "week":
    case "day":
      return "WeekName";
    default:
      return "MonthName";
  }
});
</script>

<template>
  <header class="minuta-calendar-header">
    <div class="minuta-header-title">
      <component :is="unitComponent" :unit="unitValue" />
    </div>
    <div class="navigation">
      <PreviousMonthButton :unit="unitValue" />
      <TodayButton />
      <NextMonthButton :unit="unitValue" />
    </div>
  </header>
</template>
