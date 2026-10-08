<script setup lang="ts">
import { onBeforeUnmount, onMounted, useTemplateRef } from 'vue'
import { useDateFieldContext } from './date-field-context'

const { label } = defineProps<{
  label: string
}>()

defineSlots<Record<string, never>>()

const { element } = useDateFieldContext()
const input = useTemplateRef<HTMLInputElement>('input')

onMounted(() => {
  element.value = input.value ?? undefined
})

onBeforeUnmount(() => {
  element.value = undefined
})
</script>

<template>
  <label class="date-field-label">
    {{ label }}
    <input ref="input" class="date-field-input" inputmode="numeric" />
  </label>
</template>

<style scoped>
.date-field-label {
  display: grid;
  gap: 0.25rem;
}

.date-field-input {
  font-family: monospace;
  font-size: 1.5rem;
  padding: 0.5rem;
}
</style>
