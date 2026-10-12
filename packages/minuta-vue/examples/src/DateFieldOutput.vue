<script setup lang="ts">
import { computed } from 'vue'
import { useDateFieldContext } from './date-field-context'

const JSON_INDENT = 2

defineSlots<Record<string, never>>()

const { date, state } = useDateFieldContext()
const stateJson = computed(() => JSON.stringify(state.value, undefined, JSON_INDENT))
</script>

<template>
  <output class="grid gap-2 text-sm">
    <div class="flex items-baseline justify-between gap-4">
      <code class="text-muted-foreground">toDate()</code>
      <span v-if="date" class="font-medium">{{ date.toDateString() }}</span>
      <em v-else class="text-muted-foreground">undefined (incomplete or invalid)</em>
    </div>
    <details>
      <summary class="cursor-pointer text-muted-foreground select-none hover:text-foreground">
        Input state
      </summary>
      <pre class="mt-2 max-h-72 overflow-auto rounded-md bg-muted p-3 font-mono text-xs">{{
        stateJson
      }}</pre>
    </details>
  </output>
</template>
