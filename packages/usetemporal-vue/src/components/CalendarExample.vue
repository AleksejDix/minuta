<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { Period } from "@allystudio/usetemporal";
import { createNativeAdapter } from "@allystudio/usetemporal/native";
import { createTemporal } from "../createTemporal";
import { usePeriod } from "../usePeriod";

const WEEKDAY_ORDER: Record<0 | 1, string[]> = {
  0: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  1: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
};

const dayFormatter = new Intl.DateTimeFormat("en-US", { weekday: "short" });
const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});
const rangeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

const date = ref(new Date());
const now = ref(new Date());
const weekStartsOn = ref<0 | 1>(1);
const adapter = ref(createNativeAdapter({ weekStartsOn: weekStartsOn.value }));

const temporal = createTemporal({
  adapter: adapter.value,
  date,
  now,
  locale: "en",
  weekStartsOn: weekStartsOn.value,
});

watch(weekStartsOn, (value) => {
  adapter.value = createNativeAdapter({ weekStartsOn: value });
  temporal.adapter = adapter.value;
  temporal.weekStartsOn = value;
});

const month = usePeriod(temporal, "month");
const weeks = computed(() =>
  temporal.divide(month.value, "week").map((week) => ({
    key: `${week.start.toISOString()}-${week.end.toISOString()}`,
    period: week,
    days: temporal.divide(week, "day"),
  }))
);
const weekdayLabels = computed(() => WEEKDAY_ORDER[weekStartsOn.value]);

const isCurrentMonth = computed(() => {
  const current = temporal.now.value;
  return (
    month.value.start.getFullYear() === current.start.getFullYear() &&
    month.value.start.getMonth() === current.start.getMonth()
  );
});

const rangeLabel = computed(() => {
  return `${rangeFormatter.format(month.value.start)} – ${rangeFormatter.format(
    month.value.end
  )}`;
});

function toggleWeekStart(value: 0 | 1) {
  weekStartsOn.value = value;
}

function goToDay(day: Period) {
  temporal.go(day, 0);
}

function isOutside(day: Period) {
  return !temporal.contains(month.value, day.start);
}

function isToday(day: Period) {
  return temporal.isSame(day, temporal.now.value, "day");
}
</script>

<template>
  <section class="calendar-shell" data-testid="calendar-example">
    <header class="calendar-header">
      <div>
        <h1>useTemporal Vue Demo</h1>
        <p class="subheading">
          Derived periods, divide() pattern, and adapter reactivity packaged as
          a component.
        </p>
      </div>
      <div class="toolbar-section">
        <p class="toolbar-label">Week starts on</p>
        <div class="toggle-group">
          <button
            type="button"
            class="toggle"
            :class="{ 'is-active': weekStartsOn === 0 }"
            @click="toggleWeekStart(0)"
          >
            Sunday
          </button>
          <button
            type="button"
            class="toggle"
            :class="{ 'is-active': weekStartsOn === 1 }"
            @click="toggleWeekStart(1)"
          >
            Monday
          </button>
        </div>
      </div>
    </header>

    <div class="period-display">
      <div>
        <p class="eyebrow">Browsing</p>
        <h2>{{ monthFormatter.format(month.start) }}</h2>
      </div>
      <dl>
        <div>
          <dt>Range</dt>
          <dd>{{ rangeLabel }}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{{ isCurrentMonth ? "Current month" : "Historical view" }}</dd>
        </div>
      </dl>
    </div>

    <div class="toolbar-row">
      <button
        type="button"
        class="nav-button"
        @click="temporal.previous(month)"
      >
        ← Previous
      </button>
      <button type="button" class="nav-button" @click="temporal.next(month)">
        Next →
      </button>
    </div>

    <div class="weekday-grid">
      <span v-for="weekday in weekdayLabels" :key="weekday">{{ weekday }}</span>
    </div>

    <div class="weeks-grid">
      <div v-for="week in weeks" :key="week.key" class="week-row">
        <button
          v-for="day in week.days"
          :key="day.start.toISOString()"
          type="button"
          class="day-cell"
          :class="{ 'is-outside': isOutside(day), 'is-today': isToday(day) }"
          @click="goToDay(day)"
          :title="dayFormatter.format(day.start)"
        >
          <span class="date-number">{{ day.start.getDate() }}</span>
          <span class="weekday-label">{{
            dayFormatter.format(day.start)
          }}</span>
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.calendar-shell {
  background: white;
  border-radius: 24px;
  padding: 2rem;
  width: min(960px, 100%);
  box-shadow:
    0 40px 120px rgba(15, 23, 42, 0.12),
    0 0 1px rgba(15, 23, 42, 0.1);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  gap: 1.5rem;
  align-items: center;
}

.subheading {
  color: #475569;
  margin: 0.25rem 0 0;
}

.toolbar-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-start;
}

.toolbar-label {
  margin: 0;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #64748b;
}

.toggle-group {
  display: inline-flex;
  background: #f1f5f9;
  border-radius: 999px;
  padding: 0.25rem;
  gap: 0.25rem;
}

.toggle {
  border: none;
  background: transparent;
  padding: 0.4rem 0.9rem;
  border-radius: 999px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: background 0.2s ease;
}

.toggle.is-active {
  background: white;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.12);
  color: #0f172a;
}

.period-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.period-display h2 {
  margin: 0;
  font-size: 1.75rem;
}

.period-display dl {
  display: flex;
  gap: 1rem;
  margin: 0;
}

.period-display dt {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #94a3b8;
  letter-spacing: 0.08em;
}

.period-display dd {
  margin: 0.25rem 0 0;
  font-weight: 600;
  color: #0f172a;
}

.eyebrow {
  margin: 0;
  font-size: 0.8rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #a0aec0;
}

.toolbar-row {
  display: flex;
  gap: 0.75rem;
}

.nav-button {
  border: none;
  background: #0f172a;
  color: white;
  border-radius: 999px;
  padding: 0.6rem 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.nav-button:hover {
  opacity: 0.85;
}

.weekday-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-size: 0.85rem;
  text-transform: uppercase;
  color: #94a3b8;
  letter-spacing: 0.08em;
}

.weeks-grid {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.week-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.4rem;
}

.day-cell {
  border: none;
  border-radius: 16px;
  background: #f8fafc;
  min-height: 84px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  text-align: left;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    background 0.15s ease;
  color: #0f172a;
}

.day-cell:hover {
  transform: translateY(-2px);
  background: #eef2ff;
}

.day-cell.is-outside {
  color: #94a3b8;
  background: #f1f5f9;
}

.day-cell.is-today {
  border: 2px solid #6366f1;
  background: #eef2ff;
}

.date-number {
  font-size: 1.35rem;
  font-weight: 600;
}

.weekday-label {
  font-size: 0.8rem;
  color: #94a3b8;
}

@media (max-width: 720px) {
  .calendar-shell {
    padding: 1.5rem;
  }

  .week-row,
  .weekday-grid {
    gap: 0.25rem;
  }

  .day-cell {
    min-height: 72px;
    padding: 0.4rem;
  }
}
</style>
