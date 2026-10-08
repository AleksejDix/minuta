<script setup lang="ts">
import type { ModelRef } from 'vue'

const { locales } = defineProps<{
  locales: readonly string[]
}>()

const locale: ModelRef<string> = defineModel<string>({ required: true })

defineSlots<Record<string, never>>()
</script>

<template>
  <label class="locale-select">
    Locale
    <select v-model="locale">
      <option v-for="option in locales" :key="option">{{ option }}</option>
    </select>
  </label>
</template>

<style scoped>
.locale-select {
  display: grid;
  gap: 0.25rem;
}
</style>
