<script setup lang="ts">
import type { Period } from "minuta";
import type { Ref } from "vue";
import { computed, unref } from "vue";
import { useMinuta, usePeriod } from "minuta-vue";

const props = defineProps<{
  period?: Period | Ref<Period>;
}>();

const minuta = useMinuta();
const month = usePeriod(minuta, "month");

const formatter = new Intl.DateTimeFormat(minuta.locale, { month: "long" });

const targetMonth = computed(() => {
  const provided = props.period;
  return provided ? unref(provided) : month.value;
});
</script>

<template>
  <span class="minuta-month-name">
    {{ formatter.format(targetMonth.start) }}
  </span>
</template>
