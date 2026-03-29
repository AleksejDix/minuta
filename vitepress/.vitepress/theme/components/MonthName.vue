<script setup lang="ts">
import type { Period } from "minuta";
import type { Ref } from "vue";
import { computed, unref } from "vue";
import { useMinuta, usePeriod } from "minuta-vue";

const props = defineProps<{
  period?: Period | Ref<Period>;
}>();

const temporal = useMinuta();
const month = usePeriod(temporal, "month");

const formatter = new Intl.DateTimeFormat(temporal.locale, { month: "long" });

const targetMonth = computed(() => {
  const provided = props.period;
  return provided ? unref(provided) : month.value;
});
</script>

<template>
  <span class="temporal-month-name">
    {{ formatter.format(targetMonth.start) }}
  </span>
</template>
