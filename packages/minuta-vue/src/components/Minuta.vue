<script setup lang="ts">
import { ref, watch } from "vue";
import type { Adapter } from "minuta";
import type { MinutaBuilder } from "#src/types";
import type { Ref } from "vue";
import { createMinuta } from "#src/create-minuta";

const DEFAULT_WEEK_STARTS_ON = 1;

const {
  adapter,
  date = ref(new Date()),
  lang = "en",
  now = ref(new Date()),
  weekStartsOn = DEFAULT_WEEK_STARTS_ON,
  // oxlint-disable-next-line vue/max-props -- The five props are the component's public API
} = defineProps<{
  adapter: Adapter;
  date?: Ref<Date>;
  now?: Ref<Date>;
  weekStartsOn?: number;
  lang?: string;
}>();

defineSlots<{
  default?: (scope: { minuta: MinutaBuilder }) => unknown;
}>();

const minuta = createMinuta({
  adapter,
  date,
  locale: lang,
  now,
  weekStartsOn,
});

watch(
  () => adapter,
  (value) => {
    minuta.adapter = value;
  }
);

watch(
  () => weekStartsOn,
  (value) => {
    minuta.weekStartsOn = value;
  }
);

watch(
  () => lang,
  (value) => {
    minuta.locale = value;
  }
);
</script>

<template>
  <slot :minuta="minuta" />
</template>
