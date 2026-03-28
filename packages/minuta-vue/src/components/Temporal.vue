<script setup lang="ts">
import type { Adapter } from "minuta";
import { ref, watch, type Ref } from "vue";
import { createTemporal } from "../createTemporal";
import type { TemporalBuilder } from "../types";

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
  default?: (scope: { temporal: TemporalBuilder }) => any;
}>();

const fallbackDate = ref(new Date());
const fallbackNow = ref(new Date());

const dateRef = props.date ?? fallbackDate;
const nowRef = props.now ?? fallbackNow;

const temporal = createTemporal({
  adapter: props.adapter,
  date: dateRef,
  now: nowRef,
  weekStartsOn: props.weekStartsOn,
  locale: props.lang,
});

watch(
  () => props.adapter,
  (adapter) => {
    temporal.adapter = adapter;
  }
);

watch(
  () => props.weekStartsOn,
  (value) => {
    temporal.weekStartsOn = value ?? 1;
  }
);

watch(
  () => props.lang,
  (value) => {
    temporal.locale = value ?? "en";
  }
);
</script>

<template>
  <slot :temporal="temporal" />
</template>
