<script setup lang="ts">
// All 39 real-world UTC offsets currently in use
const offsets = [
  { value: -12, label: "Baker Island" },
  { value: -11, label: "Pago Pago" },
  { value: -10, label: "Honolulu" },
  { value: -9.5, label: "Marquesas" },
  { value: -9, label: "Anchorage" },
  { value: -8, label: "Los Angeles" },
  { value: -7, label: "Denver" },
  { value: -6, label: "Chicago" },
  { value: -5, label: "New York" },
  { value: -4, label: "Santiago" },
  { value: -3.5, label: "St. John's" },
  { value: -3, label: "São Paulo" },
  { value: -2, label: "South Georgia" },
  { value: -1, label: "Azores" },
  { value: 0, label: "London" },
  { value: 1, label: "Zurich" },
  { value: 2, label: "Cairo" },
  { value: 3, label: "Moscow" },
  { value: 3.5, label: "Tehran" },
  { value: 4, label: "Dubai" },
  { value: 4.5, label: "Kabul" },
  { value: 5, label: "Karachi" },
  { value: 5.5, label: "Mumbai" },
  { value: 5.75, label: "Kathmandu" },
  { value: 6, label: "Dhaka" },
  { value: 6.5, label: "Yangon" },
  { value: 7, label: "Bangkok" },
  { value: 8, label: "Singapore" },
  { value: 8.75, label: "Eucla" },
  { value: 9, label: "Tokyo" },
  { value: 9.5, label: "Adelaide" },
  { value: 10, label: "Sydney" },
  { value: 10.5, label: "Lord Howe" },
  { value: 11, label: "Noumea" },
  { value: 12, label: "Auckland" },
  { value: 12.75, label: "Chatham Is." },
  { value: 13, label: "Apia" },
  { value: 14, label: "Kiritimati" },
];

function formatOffset(value: number): string {
  const sign = value >= 0 ? "+" : "-";
  const abs = Math.abs(value);
  const hours = Math.floor(abs);
  const minutes = (abs - hours) * 60;
  if (minutes === 0) return `${sign}${hours}`;
  return `${sign}${hours}:${String(minutes).padStart(2, "0")}`;
}

const fractional = offsets.filter((o) => o.value % 1 !== 0);
</script>

<template>
  <section class="offsets-evidence">
    <div class="offset-grid">
      <div
        v-for="offset in offsets"
        :key="offset.value"
        class="offset-chip"
        :class="{
          'is-fractional': offset.value % 1 !== 0,
          'is-zero': offset.value === 0,
          'is-zurich': offset.value === 1,
        }"
      >
        <span class="offset-value">{{ formatOffset(offset.value) }}</span>
        <span class="offset-city">{{ offset.label }}</span>
      </div>
    </div>
    <div class="legend">
      <span class="legend-item">
        <span class="legend-swatch legend-swatch--fractional"></span>
        {{ fractional.length }} fractional offsets (:30, :45)
      </span>
      <span class="legend-item">
        <span class="legend-swatch legend-swatch--whole"></span>
        {{ offsets.length - fractional.length }} whole-hour offsets
      </span>
      <span class="legend-item total">
        <strong>{{ offsets.length }} total</strong>
      </span>
    </div>
  </section>
</template>

<style scoped>
.offsets-evidence {
  max-width: 800px;
  margin: 0 auto;
}

.offset-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  justify-content: center;
}

.offset-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.25rem 0.35rem;
  border: 1px solid #ccc;
  border-radius: 3px;
  background: #fff;
  min-width: 55px;
}

.offset-chip.is-fractional {
  background: #000;
  color: #fff;
  border-color: #000;
}

.offset-chip.is-fractional .offset-value,
.offset-chip.is-fractional .offset-city {
  color: #fff;
}

.offset-chip.is-zero {
  background: #ffd700;
  border: 2px solid #000;
}

.offset-chip.is-zurich {
  border: 2px solid #000;
  background: #e5e5e5;
}

.offset-value {
  font-size: 0.65rem;
  font-weight: 700;
  color: #000;
  font-variant-numeric: tabular-nums;
}

.offset-city {
  font-size: 0.45rem;
  color: #666;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.legend {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  margin-top: 0.75rem;
  font-size: 0.7rem;
  color: #333;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.legend-swatch {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  border: 1px solid #000;
}

.legend-swatch--fractional {
  background: #000;
}

.legend-swatch--whole {
  background: #fff;
}

.total {
  font-weight: 700;
}
</style>
