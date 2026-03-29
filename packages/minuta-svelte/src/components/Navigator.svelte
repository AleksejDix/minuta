<script lang="ts">
  import { get, type Readable } from "svelte/store";
  import type { Period } from "minuta";
  import { useMinuta } from "../useMinuta";

  export let month!: Readable<Period>;

  const minuta = useMinuta();

  function previous() {
    minuta.previous(get(month));
  }

  function next() {
    minuta.next(get(month));
  }
</script>

<div class="navigator">
  <button type="button" on:click={previous} aria-label="Previous month">←</button>
  <span>Browsing {$month.start.toLocaleDateString(minuta.locale, { month: "long" })}</span>
  <button type="button" on:click={next} aria-label="Next month">→</button>
</div>
