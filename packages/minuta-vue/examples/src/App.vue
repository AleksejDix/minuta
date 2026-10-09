<script setup lang="ts">
import { CalendarGrid, CalendarHeader, CalendarRoot } from 'minuta-vue/components'
import DateFieldInput from './DateFieldInput.vue'
import DateFieldOutput from './DateFieldOutput.vue'
import DateFieldRoot from './DateFieldRoot.vue'
import LocaleSelect from './LocaleSelect.vue'
import type { Period } from 'minuta-vue'
import { shallowRef } from 'vue'

const LOCALES = ['de-CH', 'en-US', 'en-GB', 'ja-JP', 'ko-KR', 'fr-FR']
const DEFAULT_LOCALE = 'de-CH'

const locale = shallowRef(DEFAULT_LOCALE)
const value = shallowRef<Readonly<Date>>()

/**
 * Puts a picked day into the date field. A fresh Date so re-picking the same
 * day still resets the field.
 *
 * @param day - The selected day
 */
function selectDay(day: Period): void {
  value.value = new Date(day.start)
}

/**
 * Keeps the field's date as the current value.
 *
 * @param date - The date typed into the field, if complete
 */
function changeDate(date: Readonly<Date> | undefined): void {
  value.value = date
}
</script>

<template>
  <main class="app-shell">
    <section class="date-field-demo">
      <h2>datefield + input-dom</h2>
      <LocaleSelect v-model="locale" :locales="LOCALES" />
      <DateFieldRoot :locale="locale" :value="value" @change="changeDate">
        <DateFieldInput label="Date" />
        <DateFieldOutput />
      </DateFieldRoot>
    </section>
    <CalendarRoot @select="selectDay">
      <section class="calendar-shell">
        <CalendarHeader :locale="locale" />
        <CalendarGrid :locale="locale" />
      </section>
    </CalendarRoot>
  </main>
</template>

<style scoped>
.date-field-demo {
  display: grid;
  gap: 1rem;
  min-width: 20rem;
}

.date-field-demo h2 {
  margin: 0;
}

.calendar-shell {
  background: white;
  padding: 2rem;
  width: min(960px, 100%);
  box-shadow:
    0 40px 120px rgba(15, 23, 42, 0.12),
    0 0 1px rgba(15, 23, 42, 0.1);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
</style>
