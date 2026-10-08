<script setup lang="ts">
import { computed } from 'vue'
import { useDateFieldContext } from './date-field-context'

const JSON_INDENT = 2

defineSlots<Record<string, never>>()

const { date, state } = useDateFieldContext()
const stateJson = computed(() => JSON.stringify(state.value, undefined, JSON_INDENT))
</script>

<template>
  <output>
    <div>
      <strong>toDate():</strong>
      {{ ' ' }}
      <template v-if="date">{{ date.toDateString() }}</template>
      <em v-else>undefined (incomplete or invalid)</em>
    </div>
    <pre class="date-field-state">{{ stateJson }}</pre>
  </output>
</template>

<style scoped>
.date-field-state {
  font-size: 0.75rem;
  margin: 0;
}
</style>
