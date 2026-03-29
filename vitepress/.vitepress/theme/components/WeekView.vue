<script setup lang="ts">
import type { Period } from "minuta";
import type { Ref } from "vue";
import { computed, unref } from "vue";
import { Minuta } from "minuta-vue";
import WeekNamesView from "./WeekNamesView.vue";

const HOURS = Array.from({ length: 24 }, (_, index) => index);

const props = defineProps<{
  week: Period | Ref<Period>;
}>();

const minuta = useMinuta();
const targetWeek = computed(() => unref(props.week));
const days = computed(() => minuta.divide(targetWeek.value, "day"));
const hourFormatter = computed(
  () =>
    new Intl.DateTimeFormat(minuta.locale ?? "en", {
      hour: "numeric",
    })
);

const dayColumns = computed(() =>
  days.value.map((period) => ({
    period,
    isToday: minuta.isSame(period, minuta.now.value, "day"),
  }))
);

const hourLabels = computed(() =>
  HOURS.map((hour) => ({
    hour,
    label: hourFormatter.value.format(new Date(1970, 0, 1, hour)),
  }))
);
</script>

<template>
  <section class="week-view">
    <div class="week-view-header">
      <div class="week-view-hour-spacer"></div>
      <WeekNamesView class="week-view-names" />
    </div>
    <div class="week-view-body">
      <div class="week-view-hours">
        <div v-for="hour in hourLabels" :key="hour.hour" class="week-view-hour">
          {{ hour.label }}
        </div>
      </div>
      <div class="week-view-days">
        <div
          v-for="day in dayColumns"
          :key="day.period.start.toISOString()"
          class="week-view-day-column"
          :class="{ 'is-today': day.isToday }"
        >
          <div
            v-for="hour in hourLabels"
            :key="`${day.period.start.toISOString()}-${hour.hour}`"
            class="week-view-slot"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.week-view {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.week-view-header {
  display: grid;
  grid-template-columns: 70px 1fr;
  align-items: center;
}

.week-view-hour-spacer {
  height: 1px;
}

.week-view-names {
  margin-left: 0.2rem;
}

.week-view-body {
  display: flex;
  border: 1px solid var(--vp-c-border);
  border-radius: 12px;
  overflow: hidden;
}

.week-view-hours {
  flex: 0 0 70px;
  background: var(--vp-c-bg-soft);
  border-right: 1px solid var(--vp-c-border);
  display: flex;
  flex-direction: column;
}

.week-view-hour {
  flex: 1;
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  padding: 0.25rem 0.4rem;
  border-top: 1px solid var(--vp-c-border-soft);
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
}

.week-view-hour:first-child {
  border-top: 0;
}

.week-view-days {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  flex: 1;
}

.week-view-day-column {
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--vp-c-border);
}

.week-view-day-column:last-child {
  border-right: 0;
}

.week-view-day-column.is-today {
  background: color-mix(in srgb, var(--vp-c-brand) 8%, transparent);
}

.week-view-slot {
  flex: 1;
  border-top: 1px solid var(--vp-c-border-soft);
}

.week-view-slot:first-child {
  border-top: 0;
}

@media (max-width: 960px) {
  .week-view-day-header {
    font-size: 0.75rem;
  }

  .week-view-hour {
    font-size: 0.65rem;
  }
}

@media (max-width: 640px) {
  .week-view {
    gap: 0.25rem;
  }

  .week-view-header {
    grid-template-columns: 50px repeat(7, minmax(0, 1fr));
  }

  .week-view-hours {
    flex-basis: 50px;
  }
}
</style>
