<script setup lang="ts">
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import type { ModelRef } from 'vue'
import { useId } from 'vue'

const { locales } = defineProps<{
  locales: readonly string[]
}>()

const locale: ModelRef<string> = defineModel<string>({ required: true })

defineSlots<Record<string, never>>()

const id = useId()
</script>

<template>
  <div class="grid gap-2">
    <Label :for="id">Locale</Label>
    <Select v-model="locale">
      <SelectTrigger :id="id" class="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem v-for="option in locales" :key="option" :value="option">
          {{ option }}
        </SelectItem>
      </SelectContent>
    </Select>
  </div>
</template>
