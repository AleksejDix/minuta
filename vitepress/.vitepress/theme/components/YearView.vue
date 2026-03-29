<script setup lang="ts">
import type { Period } from "minuta";
import { computed } from "vue";
import { Minuta } from "minuta-vue";
import MonthName from "./MonthName.vue";
import MonthGrid from "./MonthGrid.vue";

const props = defineProps<{
  year: Period;
}>();

const minuta = useMinuta();
const months = computed(() => minuta.divide(props.year, "month"));
</script>

<template>
  <section class="year-view">
    <div class="year-view-grid">
      <article
        v-for="month in months"
        :key="month.start.toISOString()"
        class="year-view-month"
      >
        <header class="year-view-month-header">
          <MonthName :period="month" />
        </header>
        <MonthGrid :month="month" :interactive="false" density="compact" :selected-day="null" />
      </article>
    </div>
  </section>
</template>

<style scoped>
.year-view {
  width: 100%;
}

.year-view-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.year-view-month {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  border-radius: 12px;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.year-view-month-header {
  font-weight: 600;
  font-size: 0.95rem;
}

@media (max-width: 960px) {
  .year-view-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .year-view-grid {
    grid-template-columns: 1fr;
  }
}
</style>
