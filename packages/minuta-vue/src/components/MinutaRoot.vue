<script setup lang="ts">
import type { MinutaRootProps, MinutaState } from "#src/types";
import { minutaContextKey } from "#src/minuta-context";
import { provide } from "vue";
import { useMinuta } from "#src/use-minuta";

const { date, now, unit, units } = defineProps<MinutaRootProps>();

defineSlots<{
  default?: (scope: { minuta: MinutaState }) => unknown;
}>();

const minuta = useMinuta(() => ({ date, now, unit, units }));
provide(minutaContextKey, minuta);
</script>

<template>
  <slot :minuta="minuta" />
</template>
