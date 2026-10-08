<script setup lang="ts">
import type { CalendarHeaderProps } from "./types";
import { computed } from "vue";
import { formatPeriod } from "minuta/format";
import { useCalendarContext } from "./calendar-context";
import { useMinutaContext } from "#src/minuta-context";

const { locale = "en-US" } = defineProps<CalendarHeaderProps>();

defineSlots<Record<string, never>>();

useCalendarContext();
const minuta = useMinutaContext();
const label = computed(() => formatPeriod(minuta.browsing.value, locale));

/**
 * Browses the previous month.
 */
function showPrevious(): void {
  minuta.browse(minuta.previous(minuta.browsing.value));
}

/**
 * Browses the next month.
 */
function showNext(): void {
  minuta.browse(minuta.next(minuta.browsing.value));
}
</script>

<template>
  <div class="calendar-header">
    <button
      type="button"
      class="nav-button"
      aria-label="Previous month"
      data-testid="calendar-previous"
      @click="showPrevious"
    >
      ← Previous
    </button>
    <h2 aria-live="polite" data-testid="calendar-label">{{ label }}</h2>
    <button
      type="button"
      class="nav-button"
      aria-label="Next month"
      data-testid="calendar-next"
      @click="showNext"
    >
      Next →
    </button>
  </div>
</template>

<style scoped>
.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.calendar-header h2 {
  margin: 0;
  font-size: 1.75rem;
}

.nav-button {
  border: none;
  background: #0f172a;
  color: white;
  border-radius: 0;
  padding: 0.6rem 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.nav-button:hover {
  opacity: 0.85;
}
</style>
