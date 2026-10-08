<script setup lang="ts">
import { provide, watch } from 'vue'
import type { DateFieldRootProps } from './date-field-context'
import { dateFieldContextKey } from './date-field-context'
import { useDateField } from './use-date-field'

const { locale, value } = defineProps<DateFieldRootProps>()

const emit = defineEmits<{
  change: [date: Readonly<Date> | undefined]
}>()

defineSlots<{
  default?: () => unknown
}>()

/**
 * Reads the time of an optional date.
 *
 * @param date - The date, if any
 * @returns Its time, or undefined
 */
function timeOf(date: Readonly<Date> | undefined): number | undefined {
  if (date === undefined) {
    return undefined
  }
  return date.getTime()
}

const { date, element, setDate, state } = useDateField(() => locale, value)

// A date picked outside (the calendar) replaces the field's value
watch(
  () => value,
  (next) => {
    if (next !== undefined && timeOf(next) !== timeOf(date.value)) {
      setDate(next)
    }
  },
)

watch(
  () => timeOf(date.value),
  () => {
    emit('change', date.value)
  },
)

provide(dateFieldContextKey, { date, element, state })
</script>

<template>
  <slot />
</template>
