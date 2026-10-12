<script setup lang="ts">
import { onBeforeUnmount, onMounted, useId, useTemplateRef } from 'vue'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useDateFieldContext } from './date-field-context'

const { label } = defineProps<{
  label: string
}>()

defineSlots<Record<string, never>>()

const id = useId()
const { element, state } = useDateFieldContext()
const input = useTemplateRef<InstanceType<typeof Input>>('input')

/**
 * The `<input>` of shadcn's Input, which renders it as its root element.
 *
 * @param component - The mounted Input, if any
 * @returns The input element, if mounted
 */
function inputElement(component: InstanceType<typeof Input> | null): HTMLInputElement | undefined {
  if (component === null) {
    return undefined
  }
  const root: unknown = component.$el
  if (root instanceof HTMLInputElement) {
    return root
  }
  return undefined
}

onMounted(() => {
  element.value = inputElement(input.value)
})

onBeforeUnmount(() => {
  element.value = undefined
})
</script>

<template>
  <div class="grid gap-2">
    <Label :for="id">{{ label }}</Label>
    <!-- input-dom owns the value; binding it keeps Input's v-model in step -->
    <Input
      :id="id"
      ref="input"
      :model-value="state.buffer.text"
      inputmode="numeric"
      class="font-mono tabular-nums"
    />
  </div>
</template>
