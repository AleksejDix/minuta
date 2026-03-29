<script setup lang="ts">
import { computed } from "vue";
import { useMinuta, usePeriod } from "minuta-vue";

const minuta = useMinuta();
const weekPeriod = usePeriod(minuta, "week");
const weekdays = computed(() => minuta.divide(weekPeriod.value, "day"));

const formatter = new Intl.DateTimeFormat(minuta.locale, { weekday: "short" });

</script>

<template>
  <div class="week-names-view">
    <span v-for="weekday in weekdays" :key="weekday.toString()">
      {{ formatter.format(weekday.start) }}
    </span>
  </div>
</template>

<style scoped>
.week-names-view {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  text-align: center;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-2);
}
</style>
