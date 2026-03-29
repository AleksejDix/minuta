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

const temporal = useMinuta();
const unitRef = computed(() => props.unit);
const targetPeriod = usePeriod(temporal, unitRef);
const formatter = computed(
  () => new Intl.DateTimeFormat(temporal.locale ?? "en", { year: "numeric" })
);
</script>

<template>
  <span class="temporal-year-name">
    {{ formatter.format(targetPeriod.date) }}
  </span>
</template>
