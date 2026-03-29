<script setup lang="ts">
import type { Unit } from "minuta";
import { computed } from "vue";
import { useMinuta, usePeriod } from "minuta-vue";

const props = withDefaults(
  defineProps<{
    unit?: Unit;
  }>(),
  {
    unit: "month",
  }
);

const minuta = useMinuta();
const unitRef = computed(() => props.unit);
const targetPeriod = usePeriod(minuta, unitRef);

function goNext() {
  minuta.next(targetPeriod.value);
}
</script>

<template>
  <button class="minuta-nav-button" @click="goNext">
    <slot>Next</slot>
  </button>
</template>
