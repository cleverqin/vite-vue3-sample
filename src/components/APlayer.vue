<template>
  <div class="a-player-panel" :class="{ 'a-player-hide': !isShow }">
    <audio ref="audioRef" :src="musicInfo.url" />
    <div class="a-player-container">
      <div class="a-poster-container">
        <img :src="musicInfo.pic" alt="" class="a-poster-img" />
        <img v-if="!musicInfo.isPaused" src="../assets/wave.gif" alt="" class="a-playing-img" />
      </div>
      <div class="a-info-container">
        <div class="a-info-row">
          <SvgIcon class="row-icon" :class="{ 'loading-icon': loading }" :name="loading ? 'loading' : 'music'" />
          <span :title="musicInfo.name">{{ musicInfo.name }}</span>
        </div>
        <div class="a-info-row">
          <SvgIcon
            class="row-icon icon-btn"
            :name="isFavorite(musicInfo.rid) ? 'like-fill' : 'like'"
            @click="toggleFavorite(musicInfo)"
          />
          <span :title="musicInfo.artist">{{ musicInfo.artist }}</span>
        </div>
        <div class="a-info-row">{{ fmtTime(musicInfo.duration) }}</div>
      </div>
      <div class="a-control-container">
        <button class="a-prev-btn" title="上一曲" @click="playPrev()">
          <SvgIcon name="play-previous" />
        </button>
        <button class="a-toggle-btn" title="播放/暂停" @click="togglePlay()">
          <SvgIcon :name="musicInfo.isPaused ? 'play' : 'pause'" />
        </button>
        <button class="a-prev-btn" title="下一曲" @click="playNext()">
          <SvgIcon name="play-next" />
        </button>
        <button class="a-volume-btn" @click="toggleMuted()">
          <SvgIcon :name="musicInfo.isMuted ? 'mute' : 'volume'" />
        </button>
      </div>
      <div class="a-right-container">
        <div class="a-menu-container">
          <button class="a-menu-btn" @click="handleFavoriteList()">
            <SvgIcon name="folder-fill" />
          </button>
          <button class="a-menu-btn" @click="isShowLyric = !isShowLyric">
            <span style="font-size: 13px">词</span>
          </button>
          <button class="a-menu-btn" @click="isShowList = !isShowList">
            <SvgIcon name="menu-list" />
          </button>
        </div>
        <div class="a-volume-container">
          <MyProgress
            :is-tips="false"
            :disabled="musicInfo.isMuted"
            :sync="true"
            :progress="musicInfo.volume"
            @change-progress="handleChangeVolume"
          />
        </div>
        <div class="a-current-time">
          {{ fmtTime(musicInfo.currentTime) }}
        </div>
      </div>
    </div>
    <div class="a-time-container">
      <MyProgress :progress="timeProgress" :fmt="fmtTipTime" @change-progress="handleTimeChange" />
    </div>
    <div v-show="isShowList" class="ui-songs-warp">
      <div class="ui-songs-header">
        <div class="ui-songs-title">播放列表 ({{ songList.length }})</div>
        <form class="my-search-form" @submit.prevent="searchList()">
          <div class="my-input">
            <input v-model="searchForm.keyword" type="text" placeholder="请输入歌名、歌手" />
            <button class="btn-search" type="submit">
              <SvgIcon :class="{ 'loading-icon': searching }" :name="searching ? 'loading' : 'search'" />
            </button>
          </div>
        </form>
        <button class="ui-list-close-btn" @click="isShowList = false">
          <SvgIcon name="close" />
        </button>
      </div>
      <div ref="list" class="ui-songs-container scroll">
        <TransitionGroup class="ui-song-list" :name="transitionName" tag="ul">
          <li v-for="(item, i) in songList" :key="item.rid" :class="{ active: item.rid === musicInfo.rid }">
            <div class="ui-song-status">
              <SvgIcon name="music" />
            </div>
            <div class="ui-song-item-info">{{ i + 1 }}.{{ item.name }}-{{ item.artist }}</div>
            <div class="ui-song-control">
              <div class="ui-song-control-item">
                <SvgIcon
                  :class="{ 'loading-icon': loadingRid === item.rid }"
                  :name="loadingRid === item.rid ? 'loading' : 'play'"
                  @click="playSong(item)"
                />
              </div>
              <div class="ui-song-control-item">
                <SvgIcon :name="isFavorite(item.rid) ? 'like-fill' : 'like'" @click="toggleFavorite(item)" />
              </div>
              <div v-if="i !== 0" class="ui-song-control-item">
                <SvgIcon name="up" @click="moveUp(item)" />
              </div>
              <div v-if="i !== songList.length - 1" class="ui-song-control-item">
                <SvgIcon name="down" @click="moveDown(item)" />
              </div>
            </div>
          </li>
        </TransitionGroup>
      </div>
    </div>
    <div class="ui-toggle-warp" @click="isShow = !isShow">
      <SvgIcon :name="isShow ? 'left' : 'right'" />
    </div>
    <div class="ui-player-lyric" :class="{ 'a-lyric-hide': !isShowLyric }">
      <div
        class="ui-lyric-bg"
        :style="{ backgroundImage: 'url(' + (musicInfo.pic ? musicInfo.pic : defaultPic) + ')' }"
      />
      <LyricPanel
        :source-lrc="musicInfo.lrc"
        :current-time="musicInfo.currentTime"
        :loading="loadingRid !== null"
        @change-lyric="handleChangeLyric"
      />
      <button class="ui-close-btn" @click="isShowLyric = false">
        <SvgIcon name="close" />
      </button>
    </div>
    <teleport to="body">
      <transition name="fade">
        <div
          v-if="messageState.isShowMessage"
          class="a-message-container"
          :class="'a-message-' + messageState.messageType"
          :style="{ marginBottom: isShowList ? '235px' : '0' }"
        >
          {{ messageState.text }}
        </div>
      </transition>
    </teleport>
    <teleport to="body">
      <div v-if="!isShowLyric" class="desktop-lyric webfont">
        <span>{{ currentLyric.text }}</span>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref, useTemplateRef } from 'vue'
import MyProgress from '@/components/MyProgress.vue'
import SvgIcon from '@/components/SvgIcon.vue'
import { getSongInfo, getSongList } from '@/api'
import LyricPanel from '@/components/LyricPanel.vue'
const songList = ref([])
const favoriteList = ref([])
const isShowList = ref(false)
const isShowLyric = ref(false)
const isShow = ref(false)
const defaultPic = ref('http://p2.music.126.net/KK2fyHMit2saFMMMDUfJ3w==/109951164249516600.jpg')
const musicInfo = reactive({
  rid: null,
  name: null,
  artist: null,
  pic: 'http://p2.music.126.net/KK2fyHMit2saFMMMDUfJ3w==/109951164249516600.jpg',
  url: null,
  lrc: null,
  volume: 0.5,
  duration: 0,
  currentTime: 0,
  isPaused: true,
  isMuted: false,
  preload: 0
})
const searchForm = reactive({
  keyword: '',
  type: 'search'
})
const audioRef = useTemplateRef('audioRef')
const transitionName = ref('list')
const messageState = reactive({
  isShowMessage: false,
  text: '',
  messageType: 'success',
  duration: 3000,
  timer: null
})
function showMessage(text, type = 'success') {
  if (!text) return
  clearTimeout(messageState.timer)
  messageState.timer = null
  messageState.text = text
  messageState.messageType = type
  messageState.isShowMessage = true
  messageState.timer = setTimeout(() => {
    messageState.isShowMessage = false
    clearTimeout(messageState.timer)
    messageState.timer = null
  }, messageState.duration)
}
const STORAGE_KEY = 'FAVORITE_LIST'
const timeProgress = computed(() => {
  if (musicInfo.duration && musicInfo.currentTime) {
    return musicInfo.currentTime / musicInfo.duration
  }
  return 0
})
function fmtTime(time) {
  let m = parseInt(time / 60)
  let s = parseInt(time % 60)
  m = m <= 9 ? '0' + m : m
  s = s <= 9 ? '0' + s : s
  return m + ':' + s
}
function fmtTipTime(progress) {
  return fmtTime(progress * musicInfo.duration)
}
const searching = ref(false)
function searchList() {
  if (searching.value) return
  const searchParams = { ...searchForm }
  if (!searchParams.keyword) {
    delete searchParams.keyword
    delete searchParams.type
  }
  searching.value = true
  getSongList(searchParams)
    .then((res) => {
      transitionName.value = 'list1'
      songList.value = res.data
      nextTick(() => {
        transitionName.value = 'list'
      })
      if (!musicInfo.rid && songList.value[0]) {
        changeSong(songList.value[0])
      }
    })
    .finally(() => {
      searching.value = false
    })
}
const loadingRid = ref(null)
const loading = ref(false)
function changeSong(song) {
  loadingRid.value = song.rid
  loading.value = true
  return new Promise((resolve, reject) => {
    if (song.rid === musicInfo.rid) {
      loadingRid.value = null
      loading.value = false
      resolve()
      return
    }
    getSongInfo(song.rid)
      .then((res) => {
        const data = res.data
        musicInfo.rid = song.rid
        musicInfo.name = song.name
        musicInfo.artist = song.artist
        musicInfo.pic = song.pic
        musicInfo.lrc = data.lrc
        musicInfo.url = data.url
        loadingRid.value = null
        loading.value = false
        if ('mediaSession' in navigator) {
          navigator.mediaSession.metadata = new window.MediaMetadata({
            title: musicInfo.name,
            artist: musicInfo.artist,
            album: musicInfo.name,
            artwork: [{ src: song.pic, sizes: '256x256', type: 'image/jpg' }]
          })
        }
        resolve()
      })
      .catch(() => {
        loading.value = false
        loadingRid.value = null
        reject()
      })
  })
}
function togglePlay() {
  if (audioRef.value.paused) {
    audioRef.value.play()
  } else {
    audioRef.value.pause()
  }
}
function playSong(song) {
  changeSong(song).finally(() => {
    audioRef.value.play()
  })
}
function playPrev() {
  const index = songList.value.findIndex((item) => item.rid === musicInfo.rid)
  if (index !== -1 && index !== 0) {
    const prevSong = songList.value[index - 1]
    if (prevSong) {
      playSong({ ...prevSong })
    }
  }
}
function playNext() {
  const index = songList.value.findIndex((item) => item.rid === musicInfo.rid)
  if (index !== -1) {
    const nextSong = songList.value[index + 1]
    if (nextSong) {
      playSong({ ...nextSong })
    }
  } else {
    const nextSong = songList.value[0]
    if (nextSong) {
      playSong({ ...nextSong })
    }
  }
}
function handleChangeVolume(progress) {
  audioRef.value.volume = progress
}
function handleTimeChange(progress) {
  audioRef.value.currentTime = musicInfo.duration * progress
}
function toggleMuted() {
  audioRef.value.muted = !audioRef.value.muted
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
function isFavorite(id) {
  return favoriteList.value.some((item) => item.rid === id)
}
function toggleFavorite(song) {
  const index = favoriteList.value.findIndex((item) => item.rid === song.rid)
  if (index === -1) {
    const songItem = {
      rid: song.rid,
      name: song.name,
      artist: song.artist,
      pic: song.pic
    }
    favoriteList.value.push({ ...songItem })
    showMessage('收藏成功！')
  } else {
    favoriteList.value.splice(index, 1)
    showMessage('取消收藏成功！')
  }
  const favoriteListJson = JSON.stringify(favoriteList.value)
  localStorage.setItem(STORAGE_KEY, favoriteListJson)
}
function handleFavoriteList() {
  transitionName.value = 'list1'
  songList.value = [...favoriteList.value]
  isShowList.value = true
  nextTick(() => {
    transitionName.value = 'list'
  })
}
const currentLyric = ref({})
function handleChangeLyric(lyric) {
  currentLyric.value = lyric
}
onMounted(() => {
  const favoriteListJson = localStorage.getItem(STORAGE_KEY) || '[]'
  favoriteList.value = JSON.parse(favoriteListJson)
  searchList()
  audioRef.value.volume = musicInfo.volume
  audioRef.value.ontimeupdate = (e) => {
    musicInfo.currentTime = e.target.currentTime
  }
  audioRef.value.onloadedmetadata = (e) => {
    musicInfo.preload = 0
    musicInfo.currentTime = 0
    musicInfo.duration = e.target.duration
  }
  audioRef.value.onpause = () => {
    musicInfo.isPaused = true
  }
  audioRef.value.onplay = () => {
    musicInfo.isPaused = false
  }
  // 播放结束
  audioRef.value.onended = () => {
    playNext()
  }
  audioRef.value.onerror = (e) => {
    console.error(e)
  }
  audioRef.value.onvolumechange = (e) => {
    musicInfo.volume = e.target.volume
    musicInfo.isMuted = e.target.muted
  }
  audioRef.value.onprogress = (e) => {
    const target = e.target
    if (target.buffered.length > 0) {
      const bufferedEnd = target.buffered.end(target.buffered.length - 1)
      musicInfo.preload = bufferedEnd / target.duration
    }
  }
  if ('mediaSession' in navigator) {
    navigator.mediaSession.setActionHandler('previoustrack', () => {
      playPrev()
    })
    navigator.mediaSession.setActionHandler('nexttrack', () => {
      playNext()
    })
  }
})
</script>

<style scoped lang="scss">
$bg-color: linear-gradient(60deg, #3b424b 0%, #3d3f4d 100%);
$hover-bg: rgba(0, 0, 0, 0.2);
$font-color: #c0c0c0;
$icon-color: #b3b3b3;
$icon-hover: #ffffff;
$border-color: #333;
.a-message-container {
  position: fixed;
  bottom: 130px;
  min-width: 120px;
  left: 10px;
  z-index: 999;
  background-color: rgba(51, 51, 51, 0.8);
  font-size: 12px;
  line-height: 20px;
  color: #f2f2f2;
  border-radius: 4px;
  padding: 3px 6px;
  &.a-message-success {
    color: #67c23a;
    background-color: #393d39;
    border: 1px solid rgba(103, 194, 58, 0.5);
  }
  &.a-message-warning {
    color: #e6a23c;
    background: #393d39;
    border: 1px solid rgba(230, 162, 60, 0.5);
  }
  &.a-message-error {
    color: #f56c6c;
    background: #393d39;
    border: 1px solid rgba(245, 108, 108, 0.5);
  }
}
.a-player-panel {
  z-index: 99;
  text-align: left;
  background-image: $bg-color;
  padding: 5px 10px;
  height: 80px;
  box-sizing: border-box;
  position: fixed;
  left: 0;
  bottom: 40px;
  transition: transform 0.5s;
  &.a-player-hide {
    transform: translateX(-100%);
  }
  .a-time-container {
    padding-top: 5px;
  }
  .a-info-container {
    height: 60px;
    position: relative;
    width: 80px;
    margin-left: 5px;
    .a-info-row {
      position: relative;
      height: 20px;
      color: $font-color;
      font-size: 12px;
      line-height: 20px;
      vertical-align: middle;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      .row-icon {
        display: inline-block;
        vertical-align: middle;
        position: relative;
        top: -1px;
        margin-right: 3px;
      }
      .icon-btn {
        cursor: pointer;
      }
    }
  }
  .a-player-container {
    display: flex;
  }
  .a-poster-container {
    position: relative;
    .a-poster-img {
      display: block;
      width: 60px;
      height: 60px;
      border-radius: 4px;
    }
    .a-playing-img {
      position: absolute;
      display: block;
      width: 10px;
      height: 10px;
      bottom: 0;
      right: 4px;
    }
  }
  .a-control-container {
    display: flex;
    height: 60px;
    align-items: center;
    button {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 0;
      flex-shrink: 0;
      flex-grow: 0;
      width: 36px;
      height: 40px;
      background-color: transparent;
      outline: none;
      border: none;
      font-size: 30px;
      color: $font-color;
      border-radius: 30px;
      cursor: pointer;
      &:hover {
        color: $icon-hover;
      }
    }
    .a-toggle-btn {
      font-size: 34px;
    }
    .a-volume-btn {
      width: 30px;
      height: 30px;
      font-size: 20px;
    }
  }
  .a-right-container {
    height: 60px;
    width: 60px;
    color: $icon-color;
    .a-volume-container {
      box-sizing: border-box;
      padding: 8px 0;
    }
    .a-current-time {
      font-size: 12px;
      text-align: right;
    }
    > div {
      height: 20px;
      line-height: 20px;
    }
    .a-menu-container {
      display: flex;
      height: 20px;
      justify-content: flex-end;
      align-items: center;
      gap: 3px;
    }
    .a-menu-btn {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 0;
      width: 20px;
      height: 20px;
      background-color: transparent;
      outline: none;
      border: none;
      color: $font-color;
      flex: 12px;
      cursor: pointer;
      &:hover {
        color: $icon-hover;
      }
    }
  }
  .ui-songs-warp {
    position: absolute;
    left: 0;
    bottom: 100%;
    width: 100%;
    .my-search-form {
      padding-right: 30px;
      .my-input {
        position: relative;
        input {
          font-size: 12px;
          line-height: 20px;
          padding: 1px 10px;
          outline: none;
          border: 1px solid $border-color;
          background-color: transparent;
          border-radius: 4px;
          color: $font-color;
        }
        .btn-search {
          display: flex;
          position: absolute;
          justify-content: center;
          align-items: center;
          right: 1px;
          top: 3px;
          padding: 0;
          outline: none;
          font-size: 12px;
          height: 22px;
          width: 22px;
          color: $font-color;
          border: none;
          background-color: #3d3f4d;
          border-radius: 0 3px 3px 0;
          cursor: pointer;
          &:hover {
            color: $icon-hover;
          }
        }
      }
    }
  }
  .ui-songs-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 30px;
    position: relative;
    background-image: $bg-color;
    border-radius: 4px 4px 0 0;
    border-bottom: 1px solid $border-color;
    .ui-list-close-btn {
      display: flex;
      justify-content: center;
      align-items: center;
      position: absolute;
      width: 20px;
      height: 20px;
      padding: 0;
      outline: none;
      border: none;
      color: $icon-color;
      border-radius: 4px;
      background-color: transparent;
      top: 5px;
      right: 5px;
      font-size: 14px;
      cursor: pointer;
      &:hover {
        color: $icon-hover;
        background-color: $hover-bg;
      }
    }
  }
  .ui-songs-title {
    height: 30px;
    line-height: 30px;
    font-size: 14px;
    color: $font-color;
    padding-left: 10px;
  }
  .ui-songs-container {
    height: 210px;
    overflow-y: auto;
    background-image: $bg-color;
    border-bottom: 1px solid $border-color;
  }
  .ui-song-list {
    list-style: none;
    padding: 0;
    margin: 0;
    position: relative;
  }
  .ui-song-status {
    display: block;
    float: left;
    width: 20px;
    height: 30px;
    line-height: 30px;
    opacity: 0;
  }
  .ui-song-status svg {
    font-size: 16px;
    color: #e64b15;
    vertical-align: middle;
  }
  .ui-song-list li.active .ui-song-status {
    opacity: 1;
  }
  .ui-song-list li {
    height: 30px;
    line-height: 30px;
    position: relative;
    padding: 0 10px;
  }
  .ui-song-list li:hover,
  .ui-song-list li.active {
    background: $hover-bg;
  }
  .ui-song-item-info {
    height: 30px;
    line-height: 30px;
    margin-left: 20px;
    margin-right: 85px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-size: 12px;
    color: $font-color;
  }
  .ui-song-list li:hover .ui-song-control {
    display: block;
  }
  .ui-song-control {
    height: 30px;
    position: absolute;
    width: 80px;
    right: 10px;
    top: 0;
    display: none;
  }
  .ui-song-control-item {
    float: left;
    width: 20px;
    text-align: center;
    height: 30px;
    line-height: 30px;
  }
  .ui-song-control-item svg {
    font-size: 16px;
    color: $icon-color;
    cursor: pointer;
  }
  .ui-song-control-item svg:hover {
    color: $icon-hover;
  }
  .ui-player-lyric {
    position: absolute;
    left: 100%;
    height: 80px;
    width: 160px;
    padding: 10px;
    box-sizing: border-box;
    border-radius: 4px;
    background-image: $bg-color;
    top: 0;
    margin-left: 25px;
    &.a-lyric-hide {
      visibility: hidden;
      opacity: 0;
    }
    .ui-lyric-bg {
      display: block;
      position: absolute;
      left: 0;
      top: 0;
      right: 0;
      bottom: 0;
      border-radius: 4px;
      background-position: center;
      background-size: cover;
      background-repeat: no-repeat;
      opacity: 0.35;
      filter: blur(20px);
    }
    .ui-close-btn {
      padding: 0;
      display: flex;
      justify-content: center;
      border-radius: 4px;
      width: 20px;
      height: 20px;
      align-items: center;
      position: absolute;
      outline: none;
      border: none;
      background-color: transparent;
      top: 3px;
      right: 3px;
      color: $icon-color;
      &:hover {
        color: $icon-hover;
        background-color: $hover-bg;
      }
    }
    ::v-deep(.lyric-item) {
      font-size: 12px;
    }
  }
  .ui-toggle-warp {
    position: absolute;
    display: flex;
    left: 100%;
    width: 20px;
    height: 80px;
    justify-content: center;
    align-items: center;
    background-image: $bg-color;
    border-radius: 0 4px 4px 0;
    top: 0;
    border-left: 1px solid $border-color;
    cursor: pointer;
    color: $icon-color;
    &:hover {
      color: $icon-hover;
    }
  }
  .loading-icon {
    display: inline-block !important;
    animation: rotate 2s infinite linear;
    color: inherit;
  }
  @keyframes rotate {
    0% {
      transform: rotate(0);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  /*定义滚动条宽高及背景，宽高分别对应横竖滚动条的尺寸*/
  .scroll::-webkit-scrollbar {
    width: 5px;
    height: 5px;
    background-color: rgba(255, 255, 255, 0);
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
}
.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0);
}
/* 1. 声明过渡效果 */
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}

/* 2. 声明进入和离开的状态 */
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: scaleY(0.01) translate(30px, 0);
}

/* 3. 确保离开的项目被移除出了布局流
      以便正确地计算移动时的动画效果。 */
.list-leave-active {
  position: absolute;
}
.desktop-lyric {
  position: fixed;
  text-align: center;
  white-space: normal;
  width: max-content;
  max-width: 90%;
  min-height: 50px;
  font-size: 40px;
  background-color: rgba(0, 0, 0, 0.2);
  padding: 5px 15px;
  z-index: 90;
  border-radius: 7px;
  min-width: 260px;
  left: 50%;
  bottom: 50px;
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
</style>
