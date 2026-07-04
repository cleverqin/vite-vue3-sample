<template>
  <transition name="slide" @after-leave="remove">
    <div v-show="isVisible" ref="alter" :class="'alter-message alter-message-' + type">{{ msg }}</div>
  </transition>
</template>

<script setup>
import { onMounted, ref } from 'vue'
const isVisible = ref(false)
const timer = ref(null)
const { msg, type, remove, duration } = defineProps({
  msg: {
    type: String,
    default: null
  },
  type: {
    type: String,
    default: 'info'
  },
  remove: {
    type: Function,
    default() {
      return () => {}
    }
  },
  duration: {
    type: Number,
    default: 3000
  }
})
function close() {
  if (timer.value) {
    clearTimeout(timer.value)
    timer.value = null
  }
  isVisible.value = false
}
onMounted(() => {
  isVisible.value = true
  if (duration) {
    timer.value = setTimeout(() => {
      isVisible.value = false
    }, duration)
  }
})
defineExpose({
  close
})
</script>

<style scoped>
.alter-message {
  position: fixed;
  z-index: 999;
  background-color: rgba(51, 51, 51, 0.8);
  font-size: 12px;
  line-height: 20px;
  color: #f2f2f2;
  border-radius: 4px;
  padding: 5px 10px;
  left: 50%;
  transform: translateX(-50%);
  top: 40px;
}
.alter-message-success {
  color: #67c23a;
  background-color: #1f211f;
  border: 1px solid rgba(103, 194, 58, 0.5);
}
.alter-message-warning {
  color: #e6a23c;
  background: #232221;
  border: 1px solid rgba(230, 162, 60, 0.5);
}
.alter-message-error {
  color: #f56c6c;
  background: #232121;
  border: 1px solid rgba(245, 108, 108, 0.5);
}
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-40px);
}
</style>
