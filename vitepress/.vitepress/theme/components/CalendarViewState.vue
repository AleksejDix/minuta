<script setup lang="ts">
import type { Unit } from "minuta";
import { computed, ref } from "vue";
import { useMinuta, usePeriod } from "minuta-vue";

const props = withDefaults(
  defineProps<{
    initialUnit?: Unit;
  }>(),
  {
    initialUnit: "month",
  }
);

const slots = defineSlots<{
  default?: (scope: {
    unit: typeof viewUnit;
    viewPeriod: ReturnType<typeof usePeriod>;
    setUnit: (next: Unit) => void;
  }) => any;
}>();

const minuta = useMinuta();
const viewUnit = ref<Unit>(props.initialUnit);
const unitComputed = computed(() => viewUnit.value);
const viewPeriod = usePeriod(minuta, unitComputed);

function setUnit(next: Unit) {
  viewUnit.value = next;
}
</script>

<template>
  <slot :unit="viewUnit" :view-period="viewPeriod" :set-unit="setUnit" />
</template>
