<script setup lang="ts">
import { CalendarGrid, CalendarHeader, CalendarRoot } from 'minuta-vue/components'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  <main class="mx-auto flex min-h-svh max-w-4xl flex-col gap-8 px-4 py-12">
    <header class="grid gap-1">
      <h1 class="text-2xl font-semibold tracking-tight">minuta</h1>
      <p class="text-sm text-muted-foreground">
        A segmented date field and a calendar that share one date.
      </p>
    </header>
    <div class="flex flex-wrap items-start gap-6">
      <Card class="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Date field</CardTitle>
          <CardDescription>
            datefield + input-dom: type, paste or step with the arrow keys.
          </CardDescription>
        </CardHeader>
        <CardContent class="grid gap-6">
          <LocaleSelect v-model="locale" :locales="LOCALES" />
          <DateFieldRoot :locale="locale" :value="value" @change="changeDate">
            <DateFieldInput label="Date" />
            <DateFieldOutput />
          </DateFieldRoot>
        </CardContent>
      </Card>
      <CalendarRoot @select="selectDay">
        <section class="calendar-shell">
          <CalendarHeader :locale="locale" />
          <CalendarGrid :locale="locale" />
        </section>
      </CalendarRoot>
    </div>
  </main>
</template>
