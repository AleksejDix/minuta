<script setup lang="ts">
// @ts-nocheck -- vendored shadcn-vue, written without exactOptionalPropertyTypes
import type { SelectGroupProps } from 'reka-ui'
import { SelectGroup } from 'reka-ui'

const props = defineProps<SelectGroupProps>()
</script>

<template>
  <SelectGroup data-slot="select-group" v-bind="props">
    <slot />
  </SelectGroup>
</template>
