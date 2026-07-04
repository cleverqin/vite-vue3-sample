<template>
  <div class="flipNumber second" :class="{ running: running }">
    <div class="time front" :data-number="front" />
    <div class="time back" :data-number="back" />
  </div>
</template>
<script setup>
import { ref, watch, toRef } from 'vue'
const props = defineProps({
  back: {
    type: [Number, String],
    default: 0
  }
})
const back = toRef(props, 'back')
const front = ref(0)
const running = ref(false)
const animateTime = ref(0.6)
front.value = props.back
watch(
  () => props.back,
  (val, oldVal) => {
    if (val !== oldVal) {
      animation()
    }
  },
  { immediate: false }
)
function animation() {
  running.value = true
  setTimeout(() => {
    running.value = false
    const back = props.back
    front.value = back
  }, animateTime.value * 900)
}
</script>

<style lang="scss" scoped>
.flipNumber {
  --time-duration: 0.6s;
  display: inline-block;
  position: relative;
  box-sizing: border-box;
  width: calc(var(--size) * 20px);
  height: calc(var(--size) * 30px);
  text-align: center;
  font-size: calc(var(--size) * 25px);
  line-height: calc(var(--size) * 30px);
  vertical-align: middle;
  font-weight: bolder;
  box-shadow: 1px 1px 3px #000;
  border-radius: 4px;
  overflow: hidden;
}
.time::before,
.time::after {
  content: attr(data-number);
  position: absolute;
  left: 0;
  right: 0;
  overflow: hidden;
  color: #959595;
  background: #191919;
  perspective: 100px;
  -webkit-perspective: 160px;
}
.time::before {
  top: 0;
  bottom: 50%;
  border-bottom: calc(var(--size) * 0.5px) solid #191919;
}
.time::after {
  top: 50%;
  bottom: 0;
  line-height: 0;
}
/*翻转前*/
.flipNumber .front::after,
.flipNumber .back::before {
  z-index: 1;
}
.flipNumber .back::after {
  z-index: 2;
  transform-origin: center top;
  -webkit-transform-origin: center top;
  transform: rotateX(0.5turn);
}

.flipNumber .front::before {
  z-index: 3;
}
/*翻转后*/
.flipNumber.running .front::before {
  transform-origin: center bottom;
  animation: frontFlipDown var(--time-duration) ease-in-out;
  backface-visibility: hidden;
}
.flipNumber.running .back::after {
  animation: backFlipDown var(--time-duration) ease-in-out;
}
@keyframes frontFlipDown {
  to {
    transform: rotateX(0.5turn);
  }
}
@keyframes backFlipDown {
  to {
    transform: rotateX(0);
  }
}
@-webkit-keyframes frontFlipDown {
  to {
    transform: rotateX(0.5turn);
  }
}
@-webkit-keyframes backFlipDown {
  to {
    transform: rotateX(0);
  }
}
</style>
