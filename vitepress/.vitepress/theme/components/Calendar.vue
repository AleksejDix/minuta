<script setup lang="ts">
import type { Period } from "minuta";
import { ref } from "vue";
import { createTemporal, usePeriod } from "minuta-vue";
import { createNativeAdapter } from "minuta/native";
import YearView from "./YearView.vue";
import MonthGrid from "./MonthGrid.vue";
import WeekView from "./WeekView.vue";

const initialDate = ref(new Date());
const minuta = createTemporal({
  adapter: createNativeAdapter({ weekStartsOn: 1 }),
  date: initialDate,
});

const month = usePeriod(minuta, "month");

const selectedDay = ref<Period | null>(null);

function selectDay(day: Period) {
  selectedDay.value = day;
}

function jump(period: Period, count: number) {
  minuta.go(period, count);
}
</script>

<template>
  <CalendarViewState v-slot="{ unit, viewPeriod, setUnit }">
    <section class="vue-minuta-demo">
      
      <div class="view-switch">
    <button
      :class="{ active: unit === 'week' }"
      @click="setUnit('week')"
      >
      Week
    </button>
      <button
      :class="{ active: unit === 'month' }"
      @click="setUnit('month')"
      >
      Month
    </button>
    <button
    :class="{ active: unit === 'year' }"
    @click="setUnit('year')"
    >
    Year
  </button>
</div>

<CalendarHeader :unit="unit" />
      <template v-if="unit === 'year'">
        <YearView :year="viewPeriod" />
      </template>
      <template v-else-if="unit === 'week'">
        <WeekView :week="viewPeriod" />
      </template>
      <template v-else>
        <MonthGrid
          :month="month"
          :selected-day="selectedDay"
          @select="selectDay"
        />
      </template>

      <footer class="demo-footer">
        <div>
          <p class="eyebrow">Selected day</p>
          <p v-if="selectedDay">
            {{ selectedDay.date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) }}
          </p>
          <p v-else>Tap a date to see details</p>
        </div>
        <div class="demo-actions">
          <button @click="jump(viewPeriod, -1)">Jump -1 {{ unit }}</button>
          <button @click="jump(viewPeriod, 1)">Jump +1 {{ unit }}</button>
        </div>
      </footer>
    </section>
  </CalendarViewState>
</template>
