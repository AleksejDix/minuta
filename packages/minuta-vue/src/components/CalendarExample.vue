<script setup lang="ts">
import CalendarGrid from "./CalendarGrid.vue";
import CalendarHeader from "./CalendarHeader.vue";
import CalendarRoot from "./CalendarRoot.vue";
import type { Period } from "minuta/core";
import { nativeUnits } from "minuta/native";
import { shallowRef } from "vue";

const SUNDAY = 0;
const MONDAY = 1;

type WeekStart = typeof SUNDAY | typeof MONDAY;

const emit = defineEmits<{
  select: [day: Period];
}>();

defineSlots<Record<string, never>>();

const weekStartsOn = shallowRef<WeekStart>(MONDAY);
const units = shallowRef(nativeUnits({ weekStartsOn: MONDAY }));

/**
 * Switches the week start by rebuilding the units.
 *
 * @param value - The new first day of the week
 */
function setWeekStart(value: WeekStart): void {
  weekStartsOn.value = value;
  units.value = nativeUnits({ weekStartsOn: value });
}

/**
 * Reports a selected day.
 *
 * @param day - The selected day
 */
function select(day: Period): void {
  emit("select", day);
}
</script>

<template>
  <section class="calendar-shell" data-testid="calendar-example">
    <header class="calendar-toolbar">
      <div>
        <h1>minuta-vue calendar</h1>
        <p class="subheading">
          CalendarRoot, CalendarHeader and CalendarGrid composed on top of
          MinutaRoot.
        </p>
      </div>
      <div class="toolbar-section">
        <p class="toolbar-label">Week starts on</p>
        <div class="toggle-group">
          <button
            type="button"
            class="toggle"
            :class="{ 'is-active': weekStartsOn === SUNDAY }"
            :aria-pressed="weekStartsOn === SUNDAY"
            @click="setWeekStart(SUNDAY)"
          >
            Sunday
          </button>
          <button
            type="button"
            class="toggle"
            :class="{ 'is-active': weekStartsOn === MONDAY }"
            :aria-pressed="weekStartsOn === MONDAY"
            @click="setWeekStart(MONDAY)"
          >
            Monday
          </button>
        </div>
      </div>
    </header>

    <CalendarRoot :units="units" @select="select">
      <CalendarHeader />
      <CalendarGrid />
    </CalendarRoot>
  </section>
</template>

<style scoped>
.calendar-shell {
  background: white;
  border-radius: 0;
  padding: 2rem;
  width: min(960px, 100%);
  box-shadow:
    0 40px 120px rgba(15, 23, 42, 0.12),
    0 0 1px rgba(15, 23, 42, 0.1);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.calendar-toolbar {
  display: flex;
  justify-content: space-between;
  gap: 1.5rem;
  align-items: center;
}

.calendar-toolbar h1 {
  margin: 0;
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
  border-radius: 0;
  padding: 0.25rem;
  gap: 0.25rem;
}

.toggle {
  border: none;
  background: transparent;
  padding: 0.4rem 0.9rem;
  border-radius: 0;
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

@media (max-width: 720px) {
  .calendar-shell {
    padding: 1.5rem;
  }
}
</style>
