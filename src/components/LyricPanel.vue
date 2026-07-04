<template>
  <div ref="lyricWarp" class="lyric-warp lyric-scroll">
    <ol class="lyric-list">
      <template v-for="(item, i) in lyricArr" :key="i">
        <li class="lyric-item" :class="{ active: curLyric.time === item.time }" :data-time="item.time">
          {{ item.text }}
        </li>
      </template>
      <li v-if="lyricArr.length === 0" class="lyric-item">暂无歌词</li>
    </ol>
    <span v-if="props.loading" class="lyric-loading" />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { parseLyric, queryLyric } from '../utils/index'
const emit = defineEmits(['change-lyric'])
const props = defineProps({
  sourceLrc: {
    type: String,
    default() {
      return ''
    }
  },
  currentTime: {
    type: Number,
    default() {
      return 0
    }
  },
  loading: {
    type: Boolean,
    default: false
  }
})
const lyricArr = ref([])
const curLyric = ref({})
const lyricWarp = ref(null)
function scrollLRC(lrc) {
  const $lrcBox = lyricWarp.value
  const $lrcList = $lrcBox.querySelector('.lyric-list')
  if (!($lrcBox && $lrcList)) return
  const listHeight = $lrcList.offsetHeight
  if (listHeight === 0) return
  if (lrc.text) {
    const $lrc = $lrcList.querySelector("[data-time='" + lrc.time + "']")
    if (!$lrc) return
    let top = $lrc.offsetTop + $lrc.offsetHeight / 2 - $lrcBox.offsetHeight * 0.5
    const maxTop = $lrcList.offsetHeight - $lrcBox.offsetHeight
    const setTop = Math.max(0, Math.min(top, maxTop))
    $lrcBox.scrollTo({
      top: setTop,
      behavior: 'smooth'
    })
  }
}
watch(
  () => props.sourceLrc,
  (newVal) => {
    lyricArr.value = parseLyric(newVal || '')
    const lyricItem = queryLyric(newVal, lyricArr.value)
    if (lyricItem.time !== curLyric.value.time) {
      curLyric.value = { ...lyricItem }
      scrollLRC(lyricItem)
      emit('change-lyric', lyricItem)
    }
  },
  {
    immediate: true
  }
)
watch(
  () => props.currentTime,
  (newVal) => {
    const lyricItem = queryLyric(newVal, lyricArr.value)
    if (lyricItem.time !== curLyric.value.time) {
      curLyric.value = { ...lyricItem }
      scrollLRC(lyricItem)
      emit('change-lyric', lyricItem)
    }
  }
)
</script>
<style scoped lang="scss">
.lyric-warp {
  height: 100%;
  overflow: auto;
  position: relative;
  .lyric-list {
    padding: 0;
    margin: 0;
    list-style: none;
    .lyric-item {
      text-align: center;
      color: #a2a2a2;
      font-size: 14px;
      line-height: 20px;
      &.active {
        color: #04d2f6;
        text-shadow: 1px 1px 3px #000;
      }
    }
  }
  .lyric-loading {
    width: 40px;
    height: 10px;
    top: 0;
    position: absolute;
    left: 50%;
    margin-left: -20px;
    background-image: url(../assets/three-dots.svg);
    background-size: 100% 100%;
    z-index: 2;
  }
  /*定义滚动条宽高及背景，宽高分别对应横竖滚动条的尺寸*/
  &.lyric-scroll::-webkit-scrollbar {
    width: 1px;
    height: 1px;
    background-color: rgba(255, 255, 255, 0);
  }
  /*定义滚动条的轨道，内阴影及圆角*/
  &.lyric-scroll::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 6px rgba(240, 240, 240, 0);
    border-radius: 10px;
    background-color: rgba(0, 89, 255, 0);
  }
  /*定义滑块，内阴影及圆角*/
  &.lyric-scroll::-webkit-scrollbar-thumb {
    /*width: 10px;*/
    height: 20px;
    border-radius: 10px;
    -webkit-box-shadow: inset 0 0 6px rgba(236, 236, 236, 0);
    background-color: rgba(203, 203, 203, 0.01);
    transition: all 0.5s;
  }
}
</style>
