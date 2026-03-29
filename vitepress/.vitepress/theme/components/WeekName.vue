<script setup lang="ts">
import type { Unit } from "minuta";
import { computed } from "vue";
import { useMinuta, usePeriod } from "minuta-vue";

const props = withDefaults(
  defineProps<{
    unit?: Unit;
  }>(),
  {
    unit: "week",
  }
);

const minuta = useMinuta();
const unitRef = computed(() => props.unit);
const targetPeriod = usePeriod(minuta, unitRef);
const weekLabel = computed(() => {
  const period = targetPeriod.value;
  const weekNumber = getISOWeek(period.start);
  return weekNumber.toString().padStart(2, "0");
});

function getISOWeek(date: Date): number {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNr = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNr + 3);
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const diff = target.getTime() - firstThursday.getTime();
  return 1 + Math.round(diff / (7 * 24 * 60 * 60 * 1000));
}
</script>

<template>
  <span class="minuta-week-name">
    Week {{ weekLabel }}
  </span>
</template>
