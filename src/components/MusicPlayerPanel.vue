<script setup>
import { useAPlayer } from '@/hooks/aplayer'
import { onMounted, reactive, ref, useTemplateRef } from 'vue'
import SvgIcon from '@/components/SvgIcon.vue'
import MyProgress from '@/components/MyProgress.vue'
import LyricPanel from '@/components/LyricPanel.vue'
import MyInput from '@/components/MyInput.vue'
import MyButton from '@/components/MyButton.vue'
const audioRef = useTemplateRef('audioRef')
const {
  musicInfo,
  searchList,
  searching,
  playPrev,
  togglePlay,
  playNext,
  playSong,
  toggleMuted,
  handleChangeVolume,
  handleTimeChange,
  timeProgress,
  songList,
  loading,
  loadingRid,
  isFavorite,
  toggleFavorite,
  handleFavoriteList
} = useAPlayer(audioRef)
const isShowPanel = ref(false)
const searchForm = reactive({
  keyword: '',
  type: 'search'
})
function fmtTime(time = 0) {
  let m = parseInt(time / 60)
  let s = parseInt(time % 60)
  m = m <= 9 ? '0' + m : m
  s = s <= 9 ? '0' + s : s
  return m + ':' + s
}
function fmtTipTime(progress) {
  return fmtTime(progress * musicInfo.duration)
}
function moveUp(song) {
  const index = songList.value.findIndex((item) => item.rid === song.rid)
  if (index !== -1) {
    const prevIndex = index - 1
    if (prevIndex >= 0) {
      const prevSong = songList.value[prevIndex]
      songList.value[prevIndex] = song
      songList.value[index] = prevSong
    }
  }
}
function moveDown(song) {
  const index = songList.value.findIndex((item) => item.rid === song.rid)
  const len = songList.value.length
  if (index !== -1) {
    const nextIndex = index + 1
    if (nextIndex < len) {
      const nextSong = songList.value[nextIndex]
      songList.value[nextIndex] = song
      songList.value[index] = nextSong
    }
  }
}
const currentLyric = ref({})
function handleChangeLyric(lyric) {
  currentLyric.value = lyric
}
onMounted(() => {
  searchList({})
})
</script>
<template>
  <div class="player-warp">
    <div class="player-container">
      <audio ref="audioRef" :src="musicInfo.url" />
      <div class="player-control-container">
        <button class="prev-btn" title="上一曲" @click="playPrev()">
          <SvgIcon name="play-previous" />
        </button>
        <button class="toggle-btn" title="播放/暂停" @click="togglePlay()">
          <SvgIcon :name="musicInfo.isPaused ? 'play' : 'pause'" />
        </button>
        <button class="prev-btn" title="下一曲" @click="playNext()">
          <SvgIcon name="play-next" />
        </button>
      </div>
      <div class="player-poster-container">
        <img :src="musicInfo.pic" alt="" class="player-poster-img" />
        <img v-if="!musicInfo.isPaused" src="../assets/wave.gif" alt="" class="playing-img" />
        <div v-if="loading" class="loading-mask">
          <SvgIcon name="loading" class="loading-icon" />
        </div>
      </div>
      <div class="player-info-container">
        <div class="player-text-row">
          <div class="text-row">
            <SvgIcon
              class="icon-btn"
              :name="isFavorite(musicInfo.rid) ? 'like-fill' : 'like'"
              @click="toggleFavorite(musicInfo)"
            />
            <span :title="musicInfo.name + '-' + musicInfo.artist">{{ musicInfo.name }}-{{ musicInfo.artist }}</span>
          </div>
          <div v-if="!isShowPanel" class="lyric-row">
            <span>{{ currentLyric.text }}</span>
          </div>
        </div>
        <div class="player-time-row">
          <div class="player-time-warp">
            <MyProgress :progress="timeProgress" :fmt="fmtTipTime" @change-progress="handleTimeChange" />
          </div>
          <div class="player-time-info">{{ fmtTime(musicInfo.duration) }}/{{ fmtTime(musicInfo.currentTime) }}</div>
        </div>
      </div>
      <div class="player-volume-container">
        <button class="volume-btn" @click="toggleMuted()">
          <SvgIcon :name="musicInfo.isMuted ? 'mute' : 'volume'" />
        </button>
        <div class="player-volume-box">
          <div class="player-volume-warp">
            <MyProgress
              :is-tips="false"
              direction="vertical"
              :disabled="musicInfo.isMuted"
              :sync="true"
              :progress="musicInfo.volume"
              @change-progress="handleChangeVolume"
            />
          </div>
        </div>
      </div>
      <div class="player-list-btn-container">
        <button class="list-btn" @click="isShowPanel = !isShowPanel">
          <SvgIcon name="menu-list" />
        </button>
      </div>
      <transition name="slide">
        <div v-show="isShowPanel" class="music-panel" :class="{ 'music-hide': isShowPanel }">
          <div class="music-panel-left">
            <div class="music-panel-header">
              <span>歌曲列表({{ songList.length }})</span>
              <div class="search-from-container">
                <form @submit.prevent="searchList(searchForm)">
                  <MyInput v-model="searchForm.keyword" size="mini" placeholder="搜索歌名、歌手">
                    <template #append>
                      <MyButton icon="search" :loading="searching" @click="searchList(searchForm)"> 搜索 </MyButton>
                    </template>
                  </MyInput>
                </form>
                <MyButton icon="fire" title="热门" size="text" @click="searchList({})" />
                <MyButton icon="record-vinyl" title="新歌" size="text" @click="searchList({ type: 'new' })" />
                <MyButton icon="shuffle" title="随机" size="text" @click="searchList({ type: 'rand' })" />
                <MyButton icon="heart" title="收藏" size="text" @click="handleFavoriteList()" />
              </div>
            </div>
            <div class="music-panel-body">
              <div class="music-song-list scroll">
                <div
                  v-for="(item, i) in songList"
                  :key="i"
                  class="music-song-item"
                  :class="{ active: musicInfo.rid === item.rid }"
                >
                  <div class="status-icon">
                    <SvgIcon name="music" />
                  </div>
                  <div class="music-song-info-warp">{{ i + 1 }}.{{ item.name }}-{{ item.artist }}</div>
                  <div class="music-song-control-warp">
                    <SvgIcon
                      :class="{ 'loading-icon': loadingRid === item.rid }"
                      :name="loadingRid === item.rid ? 'loading' : 'play'"
                      class="icon-btn"
                      title="播放"
                      @click="playSong(item)"
                    />
                    <SvgIcon
                      class="icon-btn"
                      :name="isFavorite(item.rid) ? 'like-fill' : 'like'"
                      @click="toggleFavorite(item)"
                    />
                    <SvgIcon v-if="i !== 0" name="up" class="icon-btn" title="上移" @click="moveUp(item)" />
                    <SvgIcon
                      v-if="i !== songList.length - 1"
                      name="down"
                      class="icon-btn"
                      title="下移"
                      @click="moveDown(item)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="music-panel-right">
            <div class="music-panel-header">
              <div class="music-curSong-text">{{ musicInfo.name }}</div>
              <button class="icon-close" @click="isShowPanel = false">
                <SvgIcon name="close" />
              </button>
            </div>
            <div class="music-panel-body">
              <div class="music-lyric-bg" :style="{ backgroundImage: 'url(' + musicInfo.pic + ')' }" />
              <div class="music-lyric-container">
                <LyricPanel
                  :source-lrc="musicInfo.lrc"
                  class="music-lyric"
                  :current-time="musicInfo.currentTime"
                  :loading="loading"
                  @change-lyric="handleChangeLyric"
                />
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
    <teleport to="body">
      <div v-if="!isShowPanel && false" class="desktop-lyric">
        <span>{{ currentLyric.text }}</span>
      </div>
    </teleport>
  </div>
</template>

<style scoped lang="scss">
$bg-img: linear-gradient(60deg, #3b424b 0%, #3d3f4d 100%);
$font-color: #e0dcdc;
$icon-color: #c7c6c6;
$icon-hover: #fff;
.player-warp {
  background-image: $bg-img;
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
}
.player-container {
  display: flex;
  width: 1000px;
  background-image: $bg-img;
  color: $font-color;
  margin: 0 auto;
  position: relative;
  padding: 5px;
  .player-control-container {
    height: 40px;
    display: flex;
    button {
      display: flex;
      align-items: center;
      height: 40px;
      font-size: 30px;
      outline: none;
      border: none;
      background-color: transparent;
      cursor: pointer;
      color: $icon-color;
      &:hover {
        color: $icon-hover;
      }
    }
  }
  .player-poster-container {
    height: 40px;
    width: 40px;
    position: relative;
    .player-poster-img {
      display: block;
      width: 40px;
      height: 40px;
      border-radius: 4px;
    }
    .playing-img {
      display: block;
      width: 10px;
      height: 10px;
      position: absolute;
      bottom: 0;
      right: 4px;
    }
  }
  .player-info-container {
    flex: 1;
    .player-text-row,
    .player-time-row {
      height: 20px;
      line-height: 20px;
      font-size: 14px;
    }
    .player-time-row {
      display: flex;
      .player-time-warp {
        flex: 1;
        height: 20px;
        padding: 8px 5px;
        box-sizing: border-box;
      }
      .player-time-info {
        width: 90px;
        font-size: 14px;
        line-height: 20px;
      }
    }
    .player-text-row {
      display: flex;
      .text-row {
        padding: 0 5px;
        max-width: 560px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        align-items: center;
        .icon-btn {
          margin-right: 3px;
          cursor: pointer;
          color: $icon-color;
          &:hover {
            color: $icon-hover;
          }
        }
      }
      .lyric-row {
        flex: 1;
        min-width: 110px;
        color: #04d2f6;
        text-align: center;
      }
    }
  }
  .player-volume-container {
    display: flex;
    align-items: center;
    position: relative;
    justify-content: center;
    .player-volume-box {
      position: absolute;
      bottom: 100%;
      left: 50%;
      margin-left: -12px;
      display: none;
      padding-bottom: 11px;
      z-index: 999;
    }
    .player-volume-warp {
      background-color: rgba(0, 0, 0, 0.6);
      height: 100px;
      width: 4px;
      padding: 10px;
      border-radius: 2px;
    }
    .volume-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 36px;
      width: 36px;
      font-size: 20px;
      outline: none;
      border: none;
      background-color: transparent;
      cursor: pointer;
      color: $icon-color;
      &:hover {
        color: $icon-hover;
      }
    }
    &:hover {
      .player-volume-box {
        display: block;
      }
    }
  }
  .player-list-btn-container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    .list-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      font-size: 24px;
      background-color: transparent;
      outline: none;
      border: none;
      cursor: pointer;
      color: $icon-color;
      &:hover {
        color: $icon-hover;
      }
    }
  }
  .music-panel {
    width: 100%;
    position: absolute;
    left: 0;
    bottom: 100%;
    border-bottom: 1px solid #333333;
    .music-panel-left {
      width: 50%;
      float: left;
    }
    .music-panel-right {
      width: 50%;
      float: left;
      .music-lyric-container {
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        padding: 10px;
      }
      ::v-deep(.music-lyric-container .lyric-item) {
        line-height: 30px;
        font-size: 16px;
      }
    }
    .music-panel-header {
      height: 40px;
      line-height: 40px;
      font-size: 14px;
      background-color: #3d3f4d;
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
      padding: 0 10px;
      position: relative;
      color: $font-color;
      .music-curSong-text {
        text-align: center;
      }
      .icon-close {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 20px;
        height: 20px;
        padding: 0;
        position: absolute;
        right: 10px;
        top: 10px;
        font-size: 14px;
        outline: none;
        border: none;
        background-color: transparent;
        color: $icon-color;
        border-radius: 4px;
        cursor: pointer;
        z-index: 9;
        &:hover {
          color: $icon-hover;
          background-color: rgba(0, 0, 0, 0.2);
        }
      }
      .search-from-container {
        position: absolute;
        right: 10px;
        top: 4px;
        display: flex;
        align-items: center;
        gap: 5px;
        height: 32px;
        form {
          align-items: center;
          height: 28px;
          padding: 0;
        }
      }
    }
    .music-panel-left .music-panel-header {
      border-radius: 4px 0 0 0;
    }
    .music-panel-right .music-panel-header {
      border-radius: 0 4px 0 0;
    }
    .music-panel-body {
      height: 260px;
      background-image: $bg-img;
      position: relative;
    }
    .music-lyric-bg {
      position: absolute;
      width: 100%;
      height: 100%;
      background-size: cover;
      background-position: 50%;
      background-repeat: no-repeat;
      opacity: 0.2;
      filter: blur(20px);
    }
  }
  .music-song-list {
    height: 100%;
    overflow-y: scroll;
  }
  .music-song-item {
    display: flex;
    padding-left: 30px;
    padding-right: 100px;
    height: 30px;
    line-height: 30px;
    position: relative;
    font-size: 14px;
    .status-icon {
      display: flex;
      position: absolute;
      justify-content: flex-end;
      align-items: center;
      padding-right: 5px;
      box-sizing: border-box;
      width: 30px;
      height: 30px;
      left: 0;
      top: 0;
      font-size: 16px;
      opacity: 0;
    }
    .music-song-control-warp {
      display: none;
      position: absolute;
      right: 0;
      top: 0;
      height: 30px;
      width: 95px;
      font-size: 16px;
      gap: 3px;
      align-items: center;
    }
    .music-song-info-warp {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    &:hover {
      background-color: rgba(0, 0, 0, 0.2);
      .music-song-control-warp {
        display: flex;
      }
    }
    &.active {
      .status-icon {
        color: #fd0000;
        opacity: 1;
      }
    }
    .icon-btn {
      color: $icon-color;
      cursor: pointer;
      &:hover {
        color: $icon-hover;
      }
    }
  }
  .loading-icon {
    display: inline-block !important;
    animation: rotate 2s infinite linear;
    color: inherit;
  }
  .loading-mask {
    display: flex;
    position: absolute;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.52);
    border-radius: 4px;
    font-size: 14px;
    inset: 0;
  }
  @keyframes rotate {
    0% {
      transform: rotate(0);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  .slide-enter-active,
  .slide-leave-active {
    transition: all 0.2s linear;
  }
  .slide-enter-from,
  .slide-leave-to {
    opacity: 0;
    transform: translateY(100%);
  }
}
.desktop-lyric {
  position: fixed;
  text-align: center;
  white-space: normal;
  width: max-content;
  max-width: 90%;
  min-height: 50px;
  font-size: 40px;
  background-color: rgba(0, 0, 0, 0.1);
  padding: 5px 15px;
  z-index: 90;
  border-radius: 7px;
  min-width: 260px;
  left: 50%;
  bottom: 70px;
  transform: translateX(-50%);
  span {
    color: transparent;
    background-image: radial-gradient(circle at 50% 50%, #0151fd, #c00267);
    -webkit-background-clip: text;
    background-clip: text;
    filter: drop-shadow(1px 1px 1px #000);
    font-weight: bold;
  }
}
/*定义滚动条宽高及背景，宽高分别对应横竖滚动条的尺寸*/
.scroll::-webkit-scrollbar {
  width: 5px;
  height: 5px;
  background-color: rgba(255, 255, 255, 0.13);
}
/*定义滚动条的轨道，内阴影及圆角*/
.scroll::-webkit-scrollbar-track {
  -webkit-box-shadow: inset 0 0 6px rgba(240, 240, 240, 0);
  border-radius: 10px;
  background-color: rgba(0, 89, 255, 0);
}
/*定义滑块，内阴影及圆角*/
.scroll::-webkit-scrollbar-thumb {
  /*width: 10px;*/
  height: 20px;
  border-radius: 10px;
  -webkit-box-shadow: inset 0 0 6px rgba(236, 236, 236, 0.3);
  background-color: rgba(203, 203, 203, 0.54);
  transition: all 0.5s;
}
</style>
