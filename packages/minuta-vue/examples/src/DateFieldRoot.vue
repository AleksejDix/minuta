<script setup lang="ts">
import { provide, watch } from 'vue'
import type { DateFieldRootProps } from './date-field-context'
import type { Temporal } from 'temporal-polyfill'
import { dateFieldContextKey } from './date-field-context'
import { useDateField } from './use-date-field'

const { locale, value } = defineProps<DateFieldRootProps>()

const emit = defineEmits<{
  change: [date: Readonly<Temporal.PlainDate> | undefined]
}>()

defineSlots<{
  default?: () => unknown
}>()

/**
 * A day as text, so two equal days compare equal.
 *
 * @param date - The date, if any
 * @returns Its ISO text, or undefined
 */
function keyOf(date: Readonly<Temporal.PlainDate> | undefined): string | undefined {
  if (date === undefined) {
    return undefined
  }
  return date.toString()
}

const { date, element, setDate, state } = useDateField(() => locale, value)

// A date picked outside (the calendar) replaces the field's value
watch(
  () => value,
  (next) => {
    if (next !== undefined && keyOf(next) !== keyOf(date.value)) {
      setDate(next)
    }
  },
)

watch(
  () => keyOf(date.value),
  () => {
    emit('change', date.value)
  },
)

provide(dateFieldContextKey, { date, element, state })
</script>

<template>
  <slot />
</template>
