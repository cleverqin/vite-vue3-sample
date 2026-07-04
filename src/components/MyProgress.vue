<template>
  <div ref="warp" class="progress-warp" :class="classNames">
    <div class="progress-preload" :style="setPreloadStyle"></div>
    <div ref="container" class="progress-container" :style="setProgressStyle">
      <span ref="control" class="progress-control"></span>
    </div>
    <div v-if="isTips" ref="tips" class="progress-tips">
      <slot name="tips" :tips="state.tipProgress">
        {{ fmt(state.tipProgress) }}
      </slot>
    </div>
  </div>
</template>

<script setup>
import { computed, defineComponent, onMounted, reactive, useTemplateRef, watch } from 'vue'
defineComponent({
  name: 'MyProgress'
})
const props = defineProps({
  direction: {
    type: String,
    default: 'horizontal'
  },
  progress: {
    type: Number,
    default: 0
  },
  preload: {
    type: Number,
    default: 0
  },
  disabled: {
    type: Boolean,
    default: false
  },
  isTips: {
    type: Boolean,
    default: true
  },
  sync: {
    type: Boolean,
    default: false
  },
  fmt: {
    type: Function,
    default(e) {
      return e
    }
  }
})
const emit = defineEmits(['change-progress'])
const warp = useTemplateRef('warp')
const container = useTemplateRef('container')
const control = useTemplateRef('control')
const tips = useTemplateRef('tips')
const state = reactive({
  isMoving: false,
  setProgress: 0,
  tipProgress: 0
})
const directionKey = computed(() => {
  return props.direction === 'horizontal' ? 'width' : 'height'
})
const offsetKey = computed(() => {
  return props.direction === 'horizontal' ? 'offsetWidth' : 'offsetHeight'
})
const setProgressStyle = computed(() => {
  const style = {}
  style[directionKey.value] = state.setProgress * 100 + '%'
  return style
})
const setPreloadStyle = computed(() => {
  const style = {}
  style[directionKey.value] = props.preload * 100 + '%'
  return style
})
const classNames = computed(() => {
  const names = []
  names.push('progress-' + props.direction)
  if (state.isMoving) {
    names.push('progress-moving')
  }
  if (props.disabled) {
    names.push('progress-disabled')
  }
  return names.join(' ')
})
watch(
  () => props.progress,
  (nVal) => {
    if (!props.disabled && !state.isMoving) {
      const setProgress = Math.max(0, Math.min(nVal, 1))
      state.setProgress = setProgress
    }
  },
  { immediate: true }
)
function getPos(e, ele) {
  const rect = ele.getBoundingClientRect()
  const { x, y } = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  }
  return { dx: x, dy: y }
}
function calculateProgress(e) {
  const { dx, dy } = getPos(e, warp.value)
  const totalNum = warp.value[offsetKey.value]
  let setNum = dx
  if (props.direction !== 'horizontal') {
    setNum = totalNum - dy
  }
  return Math.max(0, Math.min(setNum / totalNum, 1))
}
function setProgress(progress) {
  if (props.disabled) return
  state.setProgress = progress
  if (state.isMoving) {
    if (props.sync) {
      emit('change-progress', progress)
    }
  } else {
    emit('change-progress', progress)
  }
}
function mouseDown() {
  if (props.disabled) return
  function moveEvent(e) {
    const progress = calculateProgress(e)
    setProgress(progress)
  }
  function mouseUp(e) {
    const progress = calculateProgress(e)
    setProgress(progress)
    document.removeEventListener('mousemove', moveEvent)
    document.removeEventListener('mouseup', mouseUp)
    state.isMoving = false
  }
  document.addEventListener(`mousemove`, moveEvent)
  document.addEventListener(`mouseup`, mouseUp)
}
function tipsMove(e) {
  const progress = calculateProgress(e)
  const totalWidth = warp.value.offsetWidth
  const tipsWidth = tips.value.offsetWidth
  let setW = totalWidth * progress - tipsWidth / 2
  const max = (totalWidth - tipsWidth) / totalWidth
  setW = setW / totalWidth
  setW = Math.max(0, Math.min(setW, max))
  tips.value.style.left = setW * 100 + '%'
  state.tipProgress = progress
}
onMounted(() => {
  warp.value.addEventListener('click', (e) => {
    if (props.disabled) return
    const progress = calculateProgress(e)
    setProgress(progress)
  })
  control.value.addEventListener('mousedown', () => {
    if (props.disabled) return
    state.isMoving = true
    mouseDown()
  })
  if (props.direction === 'horizontal' && props.isTips) {
    warp.value.addEventListener('mousemove', (e) => {
      tipsMove(e)
    })
  }
})
</script>

<style scoped lang="scss">
$control-color: #ffffff;
$preload-color: #c9c8c8;
$progress-color: #1db954;
$bg-color: rgb(141, 141, 141);
.progress-warp {
  position: relative;
  background-color: $bg-color;
  cursor: pointer;
  border-radius: 2px;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}
.progress-disabled .progress-control {
  display: none;
}
.progress-control {
  width: 10px;
  height: 10px;
  border-radius: 5px;
  position: absolute;
  background-color: $control-color;
  opacity: 0;
  transform: scale(0.5);
  box-shadow: 0 0 7px 1px $progress-color;
  transition: all 0.2s;
}
.progress-warp:hover .progress-control,
.progress-moving .progress-control {
  opacity: 1;
  transform: scale(1);
}
.progress-container {
  position: relative;
  background-color: $progress-color;
  border-radius: 2px;
}
.progress-preload {
  position: absolute;
  background-color: $preload-color;
  border-radius: 2px;
}
.progress-horizontal {
  width: 100%;
  height: 4px;
}
.progress-horizontal .progress-container {
  height: 100%;
  width: 0;
}
.progress-horizontal .progress-preload {
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 100%;
}
.progress-horizontal .progress-control {
  left: 100%;
  margin-left: -5px;
  top: 50%;
  margin-top: -5px;
}
.progress-vertical {
  width: 4px;
  height: 100%;
}
.progress-vertical .progress-container,
.progress-vertical .progress-preload {
  position: absolute;
  left: 0;
  bottom: 0;
}
.progress-vertical .progress-container {
  height: 0;
  width: 100%;
}
.progress-vertical .progress-preload {
  width: 100%;
  height: 0;
}
.progress-vertical .progress-control {
  bottom: 100%;
  margin-left: -5px;
  left: 50%;
  margin-bottom: -5px;
}
.progress-tips {
  position: absolute;
  font-size: 12px;
  color: #ffffff;
  line-height: 18px;
  background-color: rgb(68, 66, 66);
  border-radius: 2px;
  text-align: center;
  min-width: 20px;
  padding: 0 5px;
}
.progress-horizontal .progress-tips {
  left: 0;
  bottom: 100%;
  margin-bottom: 5px;
  opacity: 0;
  visibility: hidden;
}
.progress-horizontal:hover .progress-tips {
  opacity: 1;
  visibility: visible;
}
</style>
