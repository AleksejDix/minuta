<script setup lang="ts">
import type { Unit } from "minuta";
import { computed } from "vue";
import { useMinuta, usePeriod } from "minuta-vue";

const props = withDefaults(
  defineProps<{
    unit?: Unit;
  }>(),
  {
    unit: "year",
  }
);

const minuta = useMinuta();
const unitRef = computed(() => props.unit);
const targetPeriod = usePeriod(minuta, unitRef);
const formatter = computed(
  () => new Intl.DateTimeFormat(minuta.locale ?? "en", { year: "numeric" })
);
</script>

<template>
  <span class="minuta-year-name">
    {{ formatter.format(targetPeriod.date) }}
  </span>
</template>
