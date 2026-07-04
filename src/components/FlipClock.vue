<template>
  <div class="flip-clock-panel">
    <div class="time-unit-item">
      <template v-for="(item, i) in state.hours" :key="'h-' + i">
        <FlipNumber :back="item" />
      </template>
    </div>
    <div class="split-dot-panel">
      <div class="split-dot-item"></div>
      <div class="split-dot-item"></div>
    </div>
    <div class="time-unit-item">
      <template v-for="(item, i) in state.minutes" :key="'m-' + i">
        <FlipNumber :back="item" />
      </template>
    </div>
    <div class="split-dot-panel">
      <div class="split-dot-item"></div>
      <div class="split-dot-item"></div>
    </div>
    <div class="time-unit-item">
      <template v-for="(item, i) in state.seconds" :key="'s-' + i">
        <FlipNumber :back="item" />
      </template>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import FlipNumber from '@/components/FlipNumber.vue'
const state = reactive({
  hours: ['0', '0'],
  minutes: ['0', '0'],
  seconds: ['0', '0']
})
setInterval(() => {
  const now = new Date()
  const h = now.getHours()
  const m = now.getMinutes()
  const s = now.getSeconds()
  const hh = h > 9 ? h : '0' + h
  const mm = m > 9 ? m : '0' + m
  const ss = s > 9 ? s : '0' + s
  state.hours = hh.toString().split('')
  state.minutes = mm.toString().split('')
  state.seconds = ss.toString().split('')
}, 1000)
</script>

<style scoped lang="scss">
.flip-clock-panel {
  --size: 2;
  display: inline-flex;
  padding: 5px;
  border: 5px solid #0a0b11;
  border-radius: 7px;
  background-color: #545454;
  box-shadow: 0 0 7px 2px rgba(255, 255, 255, 0.06) inset;
  gap: 10px;
  .time-unit-item {
    display: flex;
    gap: 10px;
  }
  .split-dot-panel {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 7px;
    .split-dot-item {
      width: calc(var(--size) * 5px);
      height: calc(var(--size) * 5px);
      border-radius: calc(var(--size) * 5px);
      background-color: #959595;
      box-shadow: 1px 1px 3px #000;
    }
  }
}
</style>
