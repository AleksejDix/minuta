<script setup lang="ts">
// Three real months that produce 4, 5, and 6 week grids (Monday start)
const examples = [
  {
    label: "Feb 2027",
    grid: [
      [1, 2, 3, 4, 5, 6, 7],
      [8, 9, 10, 11, 12, 13, 14],
      [15, 16, 17, 18, 19, 20, 21],
      [22, 23, 24, 25, 26, 27, 28],
    ],
  },
  {
    label: "Apr 2025",
    grid: [
      [null, 1, 2, 3, 4, 5, 6],
      [7, 8, 9, 10, 11, 12, 13],
      [14, 15, 16, 17, 18, 19, 20],
      [21, 22, 23, 24, 25, 26, 27],
      [28, 29, 30, null, null, null, null],
    ],
  },
  {
    label: "Mar 2025",
    grid: [
      [null, null, null, null, null, 1, 2],
      [3, 4, 5, 6, 7, 8, 9],
      [10, 11, 12, 13, 14, 15, 16],
      [17, 18, 19, 20, 21, 22, 23],
      [24, 25, 26, 27, 28, 29, 30],
      [31, null, null, null, null, null, null],
    ],
  },
];

const days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
</script>

<template>
  <section class="weeks-evidence">
    <div class="calendars">
      <div v-for="ex in examples" :key="ex.label" class="mini-cal">
        <div class="mini-cal__header">
          <strong>{{ ex.label }}</strong>
          <span class="week-count">{{ ex.grid.length }} rows</span>
        </div>
        <div class="mini-cal__days">
          <span v-for="d in days" :key="d" class="day-header">{{ d }}</span>
        </div>
        <div v-for="(week, wi) in ex.grid" :key="wi" class="mini-cal__week">
          <span
            v-for="(day, di) in week"
            :key="di"
            class="mini-cal__cell"
            :class="{ 'is-empty': day === null }"
          >
            {{ day ?? "" }}
          </span>
        </div>
      </div>
    </div>
    <p class="caption">
      Same grid logic, same <code>weekStartsOn: 1</code> — but the month shape
      changes depending on which weekday the 1st lands on.
    </p>
  </section>
</template>

<style scoped>
.weeks-evidence {
  max-width: 760px;
  margin: 0 auto;
}

.calendars {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.mini-cal {
  border: 2px solid #000;
  border-radius: 6px;
  padding: 0.6rem;
  background: #fff;
  flex: 1;
  max-width: 220px;
}

.mini-cal__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.4rem;
  padding-bottom: 0.3rem;
  border-bottom: 1px solid #ccc;
  font-size: 0.8rem;
  color: #000;
}

.week-count {
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  background: #000;
  color: #fff;
  padding: 0.1rem 0.4rem;
  border-radius: 2px;
}

.mini-cal__days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-size: 0.5rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #666;
  margin-bottom: 0.2rem;
}

.mini-cal__week {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
}

.mini-cal__cell {
  text-align: center;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.2rem;
  color: #000;
  border-radius: 2px;
}

.mini-cal__cell.is-empty {
  background: #f5f5f5;
}

.caption {
  text-align: center;
  font-size: 0.75rem;
  color: #666;
  margin-top: 0.75rem;
}
</style>
