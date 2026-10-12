<script setup lang="ts">
import Playground from './Playground.vue'
</script>

<template>
  <main class="mx-auto flex min-h-svh max-w-4xl flex-col gap-8 px-4 py-12">
    <header class="grid gap-1">
      <h1 class="text-2xl font-semibold tracking-tight">minuta</h1>
      <p class="text-sm text-muted-foreground">
        A segmented date field and a calendar that share one date.
      </p>
    </header>
    <Playground />
  </main>
</template>
