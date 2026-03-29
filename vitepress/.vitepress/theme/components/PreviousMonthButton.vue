<script setup lang="ts">
import type { Unit } from "minuta";
import { computed } from "vue";
import { useMinuta, usePeriod } from "minuta-vue";

const props = defineProps<{
    unit: Unit;
  }>()

const minuta = useMinuta();
const targetPeriod = usePeriod(minuta, computed(() => props.unit));


</script>

<template>
  <button class="minuta-nav-button" @click="minuta.previous(targetPeriod)">
    <slot>Prev</slot>
  </button>
</template>
