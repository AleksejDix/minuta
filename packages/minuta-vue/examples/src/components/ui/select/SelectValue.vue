<script setup lang="ts">
// @ts-nocheck -- vendored shadcn-vue, written without exactOptionalPropertyTypes
import type { SelectValueProps } from 'reka-ui'
import { SelectValue } from 'reka-ui'

const props = defineProps<SelectValueProps>()
</script>

<template>
  <SelectValue data-slot="select-value" v-bind="props">
    <slot />
  </SelectValue>
</template>
