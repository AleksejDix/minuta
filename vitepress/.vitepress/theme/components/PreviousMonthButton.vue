<script setup lang="ts">
import type { Unit } from "minuta";
import { computed } from "vue";
import { useMinuta, usePeriod } from "minuta-vue";

const props = defineProps<{
    unit: Unit;
  }>()

const temporal = useMinuta();
const targetPeriod = usePeriod(temporal, computed(() => props.unit));


</script>

<template>
  <button class="temporal-nav-button" @click="temporal.previous(targetPeriod)">
    <slot>Prev</slot>
  </button>
</template>
