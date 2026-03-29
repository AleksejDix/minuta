<script setup lang="ts">
import type { Adapter } from "minuta";
import { ref, watch, type Ref } from "vue";
import { createMinuta } from "../createMinuta";
import type { MinutaBuilder } from "../types";

const props = withDefaults(
  defineProps<{
    adapter: Adapter;
    date?: Ref<Date>;
    now?: Ref<Date>;
    weekStartsOn?: number;
    lang?: string;
  }>(),
  {
    weekStartsOn: 1,
    lang: "en",
  }
);

const slots = defineSlots<{
  default?: (scope: { minuta: MinutaBuilder }) => any;
}>();

const fallbackDate = ref(new Date());
const fallbackNow = ref(new Date());

const dateRef = props.date ?? fallbackDate;
const nowRef = props.now ?? fallbackNow;

const minuta = createMinuta({
  adapter: props.adapter,
  date: dateRef,
  now: nowRef,
  weekStartsOn: props.weekStartsOn,
  locale: props.lang,
});

watch(
  () => props.adapter,
  (adapter) => {
    minuta.adapter = adapter;
  }
);

watch(
  () => props.weekStartsOn,
  (value) => {
    minuta.weekStartsOn = value ?? 1;
  }
);

watch(
  () => props.lang,
  (value) => {
    minuta.locale = value ?? "en";
  }
);
</script>

<template>
  <slot :minuta="minuta" />
</template>
