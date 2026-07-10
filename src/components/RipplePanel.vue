<script setup>
import { computed } from 'vue'

const { size, gap } = defineProps({
  size: {
    type: Number,
    default: 80
  },
  gap: {
    type: Number,
    default: 40
  }
})
const computedStyle = computed(() => {
  return {
    '--box-size': size + 'px',
    '--half-box-size': '-' + size / 2 + 'px',
    '--max-box-size': gap * 3 + size + 'px'
  }
})
</script>
<template>
  <div class="ripple-container" :style="computedStyle">
    <div class="ripple-box" />
    <div class="ripple-box" />
    <div class="ripple-box" />
    <div class="ripple-body">
      <slot />
    </div>
  </div>
</template>
<style scoped lang="scss">
$bgColor: rgba(255, 255, 255, 0.3);
.ripple-container {
  width: var(--box-size);
  height: var(--box-size);
  line-height: var(--box-size);
  text-align: center;
  font-size: 30px;
  color: #f2f2f2;
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  left: 50%;
  top: 50%;
  margin-left: var(--half-box-size);
  margin-top: var(--half-box-size);
}
.ripple-body {
  position: absolute;
  width: var(--box-size);
  height: var(--box-size);
  border-radius: 50%;
  background-image: url(../assets/conf_caller_avatar.png);
  background-size: 100% 100%;
  background-position: center;
}
.ripple-box {
  position: absolute;
  border-radius: 50%;
  border: 1px solid $bgColor;
}
@keyframes ripple {
  0% {
    width: var(--box-size);
    height: var(--box-size);
    opacity: 0.8;
  }
  100% {
    width: var(--max-box-size);
    height: var(--max-box-size);
    opacity: 0;
  }
}
.ripple-box:nth-child(1) {
  animation: ripple 3s linear infinite;
  animation-delay: 0s;
}
.ripple-box:nth-child(2) {
  animation: ripple 3s linear infinite;
  animation-delay: 1s;
}
.ripple-box:nth-child(3) {
  animation: ripple 3s linear infinite;
  animation-delay: 2s;
}
</style>
