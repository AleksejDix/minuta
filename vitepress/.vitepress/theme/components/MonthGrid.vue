<script setup lang="ts">
import type { Period } from "minuta";
import type { Ref } from "vue";
import { computed, unref } from "vue";
import { Minuta } from "minuta-vue";
import { createStableMonth } from "../../../../packages/minuta/src/calendar";
import WeekNamesView from "./WeekNamesView.vue";

const props = withDefaults(
  defineProps<{
    month: Period | Ref<Period>;
    selectedDay?: Period | Ref<Period | null> | null;
    interactive?: boolean;
    density?: "default" | "compact";
  }>(),
  {
    interactive: true,
    density: "default",
  }
);

const emit = defineEmits<{
  select: [day: Period];
}>();

const minuta = useMinuta();

const targetMonth = computed(() => unref(props.month));
const selectedDay = computed<Period | null>(() => {
  const value = props.selectedDay;
  const resolved = value ? unref(value) : null;
  return resolved ?? null;
});

const stableMonth = computed(() =>
  createStableMonth(
    minuta.adapter,
    minuta.weekStartsOn ?? 0,
    targetMonth.value.date
  )
);

const days = computed(() => minuta.divide(stableMonth.value, "day"));

const dayCells = computed(() =>
  days.value.map((period) => ({
    period,
    isCurrentMonth: minuta.contains(targetMonth.value, period.date),
    isSelected:
      selectedDay.value !== null &&
      minuta.isSame(period, selectedDay.value, "day"),
    isToday: minuta.isSame(period, minuta.now.value, "day"),
  }))
);

function handleSelect(day: Period) {
  if (!props.interactive) return;
  emit("select", day);
}
</script>

<template>
  <div class="month-grid" :class="[`density-${density}`]">
    <WeekNamesView class="month-grid-weeknames" />
    <div class="month-grid-days">
      <button
        v-for="cell in dayCells"
        :key="cell.period.start.toISOString()"
        type="button"
        class="month-grid-day"
        :class="{
          'is-other-month': !cell.isCurrentMonth,
          'is-selected': cell.isSelected,
          'is-today': cell.isToday,
          'is-static': !interactive,
        }"
        :disabled="!interactive"
        @click="handleSelect(cell.period)"
      >
        {{ cell.period.date.getDate() }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.month-grid {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.month-grid-weeknames {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  text-align: center;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-2);
}

.month-grid-days {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 0.35rem;
}

.month-grid-day {
  height: 3rem;
  border-radius: 10px;
  border: none;
  background: var(--vp-c-bg-mute);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease, color 0.15s ease;
}

.month-grid-day.is-other-month {
  color: var(--vp-c-text-3);
  background: transparent;
}

.month-grid-day.is-selected {
  background: var(--vp-c-brand);
  color: var(--vp-c-bg);
  box-shadow: 0 0 0 1px var(--vp-c-brand);
}

.month-grid-day.is-today {
  box-shadow: 0 0 0 1px var(--vp-c-brand);
}

.month-grid-day.is-static {
  cursor: default;
  pointer-events: none;
  opacity: 0.6;
}

.month-grid.density-compact {
  gap: 0.25rem;
}

.month-grid.density-compact .month-grid-weeknames {
  font-size: 0.6rem;
  letter-spacing: 0.06em;
}

.month-grid.density-compact .month-grid-days {
  gap: 0.2rem;
}

.month-grid.density-compact .month-grid-day {
  height: 1.6rem;
  font-size: 0.7rem;
  border-radius: 6px;
}
</style>
