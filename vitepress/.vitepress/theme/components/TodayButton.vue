<script setup lang="ts">
import { Minuta } from "minuta-vue";

const { now, go } = useMinuta();
</script>

<template>
  <button class="minuta-nav-button" @click="go(now, 0)">
    <slot>Today</slot>
  </button>
</template>
