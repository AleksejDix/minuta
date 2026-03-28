<script lang="ts">
  import { derived, get, writable } from "svelte/store";
  import type { Period } from "@allystudio/usetemporal";
  import { createNativeAdapter } from "@allystudio/usetemporal/native";
  import { createTemporal } from "../createTemporal";
  import { usePeriod } from "../usePeriod";
  import Navigator from "./Navigator.svelte";

  const date = writable(new Date());
  const now = writable(new Date());

  const temporal = createTemporal({
    adapter: createNativeAdapter({ weekStartsOn: 1 }),
    date,
    now,
    locale: "en",
  });

  const month = usePeriod(temporal, "month");
  const weekPeriods = derived(month, ($month) =>
    temporal.divide($month, "week")
  );
  const dayPeriods = derived(weekPeriods, ($weeks) =>
    $weeks.flatMap((week) => temporal.divide(week, "day"))
  );

  const monthLabel = derived(month, ($month) =>
    $month.start.toLocaleDateString(temporal.locale, {
      month: "long",
      year: "numeric",
    })
  );

  const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const browsing = temporal.browsing;

  function select(day: Period) {
    temporal.browsing.set(day);
  }

  function isCurrentMonth(day: Period) {
    return temporal.isSame(day, get(month), "month");
  }

  function isToday(day: Period) {
    return temporal.isSame(day, get(browsing), "day");
  }
</script>

<main>
  <section class="panel">
    <div>
      <h1>{$monthLabel}</h1>
      <p class="legend">Browse months and click a day to change the browsing period.</p>
    </div>

    <Navigator {month} />

    <div class="weekday-row">
      {#each weekdayLabels as label}
        <span>{label}</span>
      {/each}
    </div>

    <div class="grid">
      {#each $dayPeriods as day}
        <div
          class="day {isCurrentMonth(day) ? '' : 'inactive'} {isToday(day) ? 'selected' : ''}"
        >
          <button type="button" on:click={() => select(day)}>
            <span class="date-label">{day.date.getDate()}</span>
            <small>{day.start.toLocaleDateString(temporal.locale, { weekday: "short" })}</small>
          </button>
        </div>
      {/each}
    </div>
  </section>
</main>
