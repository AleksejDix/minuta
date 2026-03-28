<script setup lang="ts">
const offsets = Array.from({ length: 27 }, (_, i) => i - 12);

const landmarks: Record<number, string> = {
  [-12]: "Baker Island",
  [-5]: "New York",
  [0]: "London",
  [1]: "Zurich",
  [8]: "Singapore",
  [14]: "Kiritimati",
};
</script>

<template>
  <section class="hours-evidence">
    <div class="timeline-wrapper">
      <div class="timeline">
        <div
          v-for="offset in offsets"
          :key="offset"
          class="hour-slot"
          :class="{
            'is-landmark': landmarks[offset],
            'is-zero': offset === 0,
          }"
        >
          <span v-if="landmarks[offset]" class="landmark-label">
            {{ landmarks[offset] }}
          </span>
          <span v-if="landmarks[offset]" class="landmark-line"></span>
          <span class="offset-block">
            {{ offset >= 0 ? "+" : "" }}{{ offset }}
          </span>
        </div>
      </div>
    </div>

    <div class="bracket">
      <div class="bracket-line"></div>
      <span class="bracket-label">26 hours</span>
    </div>
  </section>
</template>

<style scoped>
.hours-evidence {
  max-width: 820px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.timeline-wrapper {
  overflow-x: auto;
  padding-top: 2.5rem;
}

.timeline {
  display: flex;
  gap: 2px;
  justify-content: center;
  min-width: fit-content;
}

.hour-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.offset-block {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 3px;
  background: #e8e8e8;
  font-size: 0.55rem;
  font-weight: 600;
  color: #666;
  font-variant-numeric: tabular-nums;
}

.is-landmark .offset-block {
  background: #000;
  color: #fff;
}

.is-zero .offset-block {
  background: #ffd700;
  color: #000;
  border: 2px solid #000;
  font-weight: 800;
}

.landmark-label {
  position: absolute;
  bottom: calc(100% + 4px);
  font-size: 0.5rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  white-space: nowrap;
  color: #000;
}

.landmark-line {
  position: absolute;
  bottom: 100%;
  width: 1px;
  height: 4px;
  background: #000;
}

.bracket {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0 1rem;
}

.bracket-line {
  width: 100%;
  max-width: 790px;
  height: 3px;
  background: #000;
  border-radius: 2px;
}

.bracket-label {
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: #000;
}
</style>
